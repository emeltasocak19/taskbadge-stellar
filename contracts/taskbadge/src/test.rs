#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_task_badges() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(TaskBadgeContract, ());
    let client = TaskBadgeContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let other_user = Address::generate(&env);
    let docs = String::from_str(&env, "Read Docs");
    let deploy = String::from_str(&env, "Deploy Testnet");

    assert_eq!(client.get_task_count(&user), 0);
    assert_eq!(client.get_total_tasks(), 0);
    assert!(!client.has_task(&user, &docs));

    assert_eq!(client.complete_task(&user, &docs), 1);
    assert!(client.has_task(&user, &docs));
    assert_eq!(client.get_task_count(&user), 1);
    assert_eq!(client.get_total_tasks(), 1);

    assert_eq!(client.complete_task(&user, &docs), 1);
    assert_eq!(client.get_task_count(&user), 1);
    assert_eq!(client.get_total_tasks(), 1);

    assert_eq!(client.complete_task(&user, &deploy), 2);
    assert!(client.has_task(&user, &deploy));
    assert_eq!(client.get_task_count(&user), 2);
    assert_eq!(client.get_total_tasks(), 2);

    assert_eq!(client.complete_task(&other_user, &docs), 1);
    assert_eq!(client.get_task_count(&other_user), 1);
    assert_eq!(client.get_total_tasks(), 3);
}
