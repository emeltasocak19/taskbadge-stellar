#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contract]
pub struct TaskBadgeContract;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Task(Address, String),
    TaskCount(Address),
    TotalTasks,
}

#[contractimpl]
impl TaskBadgeContract {
    pub fn complete_task(env: Env, user: Address, task: String) -> u32 {
        user.require_auth();

        let task_key = DataKey::Task(user.clone(), task);
        let count_key = DataKey::TaskCount(user);

        let already_done: bool = env.storage().persistent().get(&task_key).unwrap_or(false);
        let mut user_count: u32 = env.storage().persistent().get(&count_key).unwrap_or(0);

        if already_done {
            return user_count;
        }

        let mut total_tasks: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalTasks)
            .unwrap_or(0);

        user_count += 1;
        total_tasks += 1;

        env.storage().persistent().set(&task_key, &true);
        env.storage().persistent().set(&count_key, &user_count);
        env.storage()
            .instance()
            .set(&DataKey::TotalTasks, &total_tasks);

        user_count
    }

    pub fn has_task(env: Env, user: Address, task: String) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Task(user, task))
            .unwrap_or(false)
    }

    pub fn get_task_count(env: Env, user: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::TaskCount(user))
            .unwrap_or(0)
    }

    pub fn get_total_tasks(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalTasks)
            .unwrap_or(0)
    }
}

mod test;
