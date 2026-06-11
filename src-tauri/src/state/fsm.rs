use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CompanionState {
    Idle,
    Happy,
    Sleeping,
    Curious,
    Hover,
}

pub struct FsmInner {
    pub current_state: CompanionState,
    pub last_interaction: Instant,
    pub idle_timeout_secs: u64,
    pub sleep_timeout_secs: u64,
    pub mouse_nearby: bool,
    pub happy_trigger_time: Option<Instant>,
}

pub type FsmHandle = Arc<Mutex<FsmInner>>;

pub fn start_fsm(app: AppHandle) {
    let fsm: FsmHandle = Arc::new(Mutex::new(FsmInner {
        current_state: CompanionState::Idle,
        last_interaction: Instant::now(),
        idle_timeout_secs: 300,
        sleep_timeout_secs: 600,
        mouse_nearby: false,
        happy_trigger_time: None,
    }));

    app.manage(fsm.clone());

    let app_clone = app.clone();
    tauri::async_runtime::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_millis(500));
        loop {
            interval.tick().await;

            let next = {
                let fsm = fsm.lock().unwrap();
                let elapsed = fsm.last_interaction.elapsed();

                match &fsm.current_state {
                    CompanionState::Happy => {
                        let happy_dur = fsm
                            .happy_trigger_time
                            .map(|t| t.elapsed().as_secs())
                            .unwrap_or(999);
                        if happy_dur > 3 {
                            if fsm.mouse_nearby {
                                CompanionState::Curious
                            } else {
                                CompanionState::Idle
                            }
                        } else {
                            CompanionState::Happy
                        }
                    }
                    CompanionState::Sleeping => {
                        // Any interaction wakes up — handled by record_interaction
                        CompanionState::Sleeping
                    }
                    CompanionState::Idle | CompanionState::Curious => {
                        if elapsed.as_secs() > fsm.sleep_timeout_secs {
                            CompanionState::Sleeping
                        } else if fsm.mouse_nearby {
                            CompanionState::Curious
                        } else {
                            CompanionState::Idle
                        }
                    }
                    CompanionState::Hover => CompanionState::Hover,
                }
            };

            let mut fsm = fsm.lock().unwrap();
            if next != fsm.current_state {
                fsm.current_state = next.clone();
                drop(fsm);
                let _ = app_clone.emit("fsm_state_change", &next);
            }
        }
    });
}

pub fn record_interaction(fsm: &FsmHandle, new_state: CompanionState) {
    if let Ok(mut f) = fsm.lock() {
        f.last_interaction = Instant::now();
        if new_state == CompanionState::Happy {
            f.happy_trigger_time = Some(Instant::now());
        }
        f.current_state = new_state;
    }
}

pub fn set_mouse_nearby(fsm: &FsmHandle, nearby: bool) {
    if let Ok(mut f) = fsm.lock() {
        f.mouse_nearby = nearby;
    }
}
