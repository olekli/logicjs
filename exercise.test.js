'use strict'

const { Exercise, ignoreInvalidTransition } = require('./exercise.js');
const { make_ok, make_err, get_ok, get_err, ok, err, useJestResultMatcher } = require('okljs');

useJestResultMatcher();

describe('Exercise', () => {
  let question_factory;
  let n_params = {
    total_questions: 3,
    points_required: 4,
    time_limit: 1000
  };
  let counter;

  beforeEach(() => {
    counter = 0;
    question_factory = {
      makeQuestion: jest.fn(() => {
        counter++;
        return `question ${counter}`
      }),
      checkAnswer: jest.fn(
          (question, answer) => {
            if (answer === 'correct') {
              return { points: 2, result: true }
            } else {
              return { points: 0, result: false }
            }
          })
    };
  });

  test('launch asks question', () => {
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    let result = exercise.launch();
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/asked');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 1,
      points_achieved: 0,
      time_elapsed: time_elapsed
    });
    expect(result.data.question).toEqual('question 1');
  });

  test('correct answer correctly answers question', () => {
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    let result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/answered');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 1,
      points_achieved: 2,
      time_elapsed: time_elapsed
    });
    expect(result.data.question).toEqual('question 1');
    expect(result.data.answer).toEqual('correct');
    expect(result.data.result).toEqual(true);
  });

  test('wrong answer does not correctly answers question', () => {
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    let result = exercise.answer('foo');
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/answered');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 1,
      points_achieved: 0,
      time_elapsed: time_elapsed
    });
    expect(result.data.question).toEqual('question 1');
    expect(result.data.answer).toEqual('foo');
    expect(result.data.result).toEqual(false);
  });

  test('asking after answer asks another question', () => {
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    let result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/asked');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 2,
      points_achieved: 2,
      time_elapsed: time_elapsed
    });
    expect(result.data.question).toEqual('question 2');
  });

  test('correct answer correctly answers question after answering', () => {
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    let result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/answered');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 2,
      points_achieved: 4,
      time_elapsed: time_elapsed
    });
    expect(result.data.question).toEqual('question 2');
    expect(result.data.answer).toEqual('correct');
    expect(result.data.result).toEqual(true);
  });

  test('wrong answer does not correctly answers question after answering', () => {
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    let result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('foo');
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/answered');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 2,
      points_achieved: 2,
      time_elapsed: time_elapsed
    });
    expect(result.data.question).toEqual('question 2');
    expect(result.data.answer).toEqual('foo');
    expect(result.data.result).toEqual(false);
  });

  test('answering n questions shows result of last question', () => {
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    let result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('foo');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('bar');
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/answered');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 3,
      points_achieved: 2,
      time_elapsed: time_elapsed
    });
    expect(result.data.question).toEqual('question 3');
    expect(result.data.answer).toEqual('bar');
    expect(result.data.result).toEqual(false);
  });

  test('asking n+1 question finishes', () => {
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    let result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('foo');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('bar');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/finished');
  });

  test('answering enough questions correctly finishes with success', () => {
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    let result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('foo');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/finished');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 3,
      points_achieved: 4,
      time_elapsed: time_elapsed
    });
    expect(result.data.success).toEqual(true);
  });

  test('answering not enough questions correctly finishes with failure', () => {
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    let result = exercise.answer('foobar');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('foo');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/finished');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 3,
      points_achieved: 2,
      time_elapsed: time_elapsed
    });
    expect(result.data.success).toEqual(false);
  });

  test('missing the time limit finishes with failure', async () => {
    const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

    n_params.time_limit = 1;
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    let result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    await delay(2);

    result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/finished');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(time_elapsed).toBeGreaterThan(1);
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 3,
      points_achieved: 6,
      time_elapsed: time_elapsed
    });
    expect(result.data.success).toEqual(false);
  });

  test('time limit of 0 means no time limit', async () => {
    const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

    n_params.time_limit = 0;
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    let result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    await delay(2);

    result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.answer('correct');
    expect(ok(result)).toBe(true);

    result = exercise.ask();
    expect(ok(result)).toBe(true);

    result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/finished');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(time_elapsed).toBeGreaterThan(1);
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 3,
      points_achieved: 6,
      time_elapsed: time_elapsed
    });
    expect(result.data.success).toEqual(true);
  });

  test('no question limit runs forever', async () => {
    n_params.total_questions = 0;
    let exercise = new Exercise('e1', { question_factory: question_factory, n_params: n_params });
    exercise.launch();

    for (let i = 0; i < 100; i++) {
      let result = exercise.answer('correct');
      expect(ok(result)).toBe(true);

      result = exercise.ask();
      expect(ok(result)).toBe(true);
    }

    let result = exercise.makeView();
    expect(ok(result)).toBe(true);
    result = get_ok(result);
    expect(result.path).toEqual('e1/asked');
    let time_elapsed = result.data.n_params.time_elapsed;
    expect(time_elapsed).toBeGreaterThan(1);
    expect(result.data.n_params).toEqual({
      ...n_params,
      current_question: 101,
      points_achieved: 200,
      time_elapsed: time_elapsed
    });
    expect(result.data.question).toEqual('question 101');
  });
});

describe('ignoreInvalidTransition', () => {

  test.each([
    [ 'foo' ],
    [ [ 1, 2, 3] ],
    [ { a: 123, b: 'bar' }]
  ])('ok results are passed on', (ok) => {
    let result = make_ok(ok);
    expect(get_ok(ignoreInvalidTransition(result))).toEqual(ok);
  });

  test.each([
    [ 'foo' ],
    [ Exercise.Errors.NoView ]
  ])('other errors are passed on', (err) => {
    let result = make_err(err);
    expect(get_err(ignoreInvalidTransition(result))).toEqual(err);
  });

  test.each([
    [ Exercise.Errors.InvalidTransition ]
  ])('InvalidTransition becomes ok', (err) => {
    let result = make_err(err);
    expect(ignoreInvalidTransition(result)).toBeOk();
  });

});
