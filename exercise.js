// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { assert, make_ok, make_err, match_result } = require('okljs');
const StateMachine = require('javascript-state-machine');
const path = require('path');

class Exercise {
  static Errors = {
    InvalidTransition: Symbol('InvalidTransition'),
    NoView: Symbol('NoView')
  };

  #id = null;
  #question_factory = null;
  #n_params = {
    total_questions: 0,
    current_question: 0,
    points_required: 0,
    points_achieved: 0,
    time_limit: 0,
    time_elapsed: 0
  };
  #state_machine = null;
  #current_question = null;
  #current_answer = null;
  #current_result = null;
  #success = false;
  #t0 = 0;

  constructor(id, options) {
    this.#id = id;
    this.#question_factory = options.question_factory;
    this.#n_params = { ... options.n_params };
    this.#n_params.current_question = 0;
    this.#n_params.points_achieved = 0;
    this.#n_params.time_elapsed = 0;
    assert.isType(this.#id, 'string');
    assert.hasPropertyType(this.#question_factory, 'makeQuestion', 'function');
    assert.hasPropertyType(this.#question_factory, 'checkAnswer', 'function');
    assert.ok(this.#n_params.total_questions >= 0);
    this.#state_machine = new StateMachine({
      init: 'ready',
      transitions: [
        { name: 'launch', from: 'ready', to: 'asked' },
        { name: 'answer', from: 'asked', to: 'answered' },
        { name: 'ask', from: 'answered', to: 'asked' },
        { name: 'finish', from: 'answered', to: 'finished' }
      ]
    });
  }

  #nextQuestion() {
    this.#current_question = this.#question_factory.makeQuestion();
    this.#n_params.current_question++;
  }

  launch() {
    if (this.#state_machine.can('launch')) {
      this.#nextQuestion();
      this.#t0 = Date.now();
      this.#state_machine.launch();
      return make_ok();
    } else {
      return make_err(Exercise.Errors.InvalidTransition);
    }
  }

  #finish() {
    assert.ok(this.#state_machine.can('finish'));
    this.#success =
         (this.#n_params.points_achieved >= this.#n_params.points_required)
      && (
              (this.#n_params.time_elapsed <= this.#n_params.time_limit)
           || (this.#n_params.time_limit == 0)
         );
    this.#state_machine.finish();
    return make_ok();
  }

  answer(answer_given) {
    if (this.#state_machine.can('answer')) {
      this.#current_answer = answer_given;
      let result = this.#question_factory.checkAnswer(this.#current_question, answer_given);
      assert.hasPropertyType(result, 'points', 'number');
      assert.hasProperty(result, 'result');
      this.#n_params.points_achieved += result.points;
      this.#n_params.time_elapsed = Date.now() - this.#t0;
      this.#current_result = result.result;
      this.#state_machine.answer();
      return make_ok();
    } else {
      return make_err(Exercise.Errors.InvalidTransition);
    }
  }

  ask() {
    if (this.#state_machine.can('ask')) {
      if (
          (this.#n_params.total_questions > 0 ) &&
          (this.#n_params.current_question === this.#n_params.total_questions))
      {
        this.#finish();
      } else {
        this.#nextQuestion();
        this.#state_machine.ask();
      }
      return make_ok();
    } else {
      return make_err(Exercise.Errors.InvalidTransition);
    }
  }

  makeView() {
    if (this.#state_machine.is('asked')) {
      return make_ok({
        path: path.join(this.#id, 'asked'),
        data: {
          n_params: this.#n_params,
          question: this.#current_question
        }
      });
    } else if (this.#state_machine.is('answered')) {
      return make_ok({
        path: path.join(this.#id, 'answered'),
        data: {
          n_params: this.#n_params,
          question: this.#current_question,
          answer: this.#current_answer,
          result: this.#current_result
        }
      });
    } else if (this.#state_machine.is('finished')) {
      return make_ok({
        path: path.join(this.#id, 'finished'),
        data: {
          n_params: this.#n_params,
          success: this.#success
        }
      });
    } else {
      return make_err(Exercise.Errors.NoView);
    }
  }
};

const ignoreInvalidTransition = (result) =>
  match_result(result,
    (ok) => ok,
    (err) => err === Exercise.Errors.InvalidTransition ? make_ok() : err
  );

module.exports.Exercise = Exercise;
module.exports.ignoreInvalidTransition = ignoreInvalidTransition;
