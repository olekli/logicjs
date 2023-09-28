// Copyright 2023 Ole Kliemann
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict'

const { Generators } = require('./al_generator_static.js');
const { parseAndCheckProof } = require('./al_proof.js');
const { sentenceToString } = require('./al_print.js');

class ExerciseAlProofs {
  #mode = undefined;
  #generator = undefined;
  #current = undefined;

  constructor(mode, generators = Generators) {
    this.#mode = mode;
    if (this.#mode === 'sandbox') {
      this.#generator = undefined;
      this.#current = { premises: null, conclusion: null };
    } else {
      this.#generator = generators.al_proofs[this.#mode];
      this.#current = this.#generator.generate();
    }
  }

  newExercise() {
    if (this.#generator) {
      this.#current = this.#generator.generate();
    }
  }

  get current() {
    return {
      premises: this.#current.premises != null
        ? this.#current.premises.map((p) => sentenceToString(p))
        : [],
      conclusion: this.#current.conclusion != null
        ? sentenceToString(this.#current.conclusion)
        : ''
    };
  }

  checkAnswer(proof) {
    return parseAndCheckProof(proof, this.#current.premises, this.#current.conclusion);
  }
};

module.exports.ExerciseAlProofs = ExerciseAlProofs;
