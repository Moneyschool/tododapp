// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract TodoDapp {
    uint256 public count = 0;

    struct Task {
        uint256 id;
        string content;
        bool isCompleted;
    }

    mapping(address => Task[]) private tasks;

    event CreateTask(uint256 id, string content, bool isCompleted);
    event CompleteTask(uint256 id, bool isCompleted);

    constructor() {
        createTask("First Todo");
    }

    function createTask(string memory _content) public returns(bool) {
        count ++;
        tasks[msg.sender].push(Task(count, _content, false));
        emit CreateTask(count, _content, false);
        return true;
    }

    function updateTask(uint256 _index) public returns(bool) {
        Task memory _task = tasks[msg.sender][_index];
        _task.isCompleted = true;
        tasks[msg.sender][_index] = _task;
        emit CompleteTask(_task.id, true);
        return true;
    }

    function getTasks() external view returns(Task[] memory) {
        return tasks[msg.sender];
    }
}