/**
 * A utility that captures metrics over time based objects (like streams)
 *
 * @note Uses double underscore `__` on privates to maximize the names space of subs
 * @module Progressor
 */

"use strict";

/**
 * A measure is the current value in time that has been captured by the Progressor.
 * It includes known times, captured, and calculated values.
 * @type {object}
 * @property {int} count The number of samples that have been captured.
 * @property {int} expected The number of samples we expect to receive. This is
 * an optional value and may not be filled on.
 * @property {number} rate The number of samples divided by elapsed time in milliseconds since epoch
 * @property {int} start The time the first sample arrived, or when `progressor:start` has been called or raised.
 * @property {int} end If the `progressor:end` or `progressor:closed` event has been
 * raised, this value will contain that the time that happened in milliseconds since epoch
 * @property {int} time When the sample was captured in milliseconds since epoch
 * @property {int} elapsed The time elapsed from the first time a sample was captured.
 * It is in milliseconds
 */
const measure = {
	count   : 0,
	expected: null,
	rate    : 0,
	start   : 0,
	end     : 0,
	time    : 0,
	elapsed : 0
};

/**
 * A utility that captures metrics over time based objects (like streams)
 *
 * @name module:Progressor
 */
export default ( superclass ) => class extends superclass {
	/**
	 * @param options
	 * @param {object} options The options for the stream. These are passed directly to the stream and any leftovers are used by this class.
	 * @param {number} options.threshold How many records pass before progress is reported
	 * @param {number} options.expected The expected number of rows to be processed. If 0, then percentages will not be calculated
	 */
	constructor( options = {} ) {

		super( options );

		/**
		 * How many records pass before progress is reported. Defaults to 50,000
		 * @type {number}
		 * @private
		 */
		this.__threshold = options.threshold || 50000;

		/**
		 * The expected number of rows to be processed. If 0, then percentages will not be calculated
		 * @type {number}
		 * @private
		 */
		this.__expected = options.expected || 0;

		/**
		 * Meter event. Raise this for every chunk/object/part you process.
		 * @event module:Progressor#progressor:sample
		 */
		this.on( "progressor:sample", this.__sample );

		/**
		 * Raise this event to tell the stream to start monitoring
		 * @event module:Progressor#progressor:startMetering
		 */
		this.on( "progressor:startMetering", this.__startMetering );

		/**
		 * Raise this event to tell the stream to stop monitoring
		 * @event module:Progressor#progressor:endMetering
		 */
		this.on( "progressor:endMetering", this.__endMetering );

		/**
		 * Have we started recording stuff?
		 * @type {boolean}
		 * @private
		 */
		this.__started = false;

		/**
		 * The number of samples that have been collected
		 * @type {int}
		 * @private
		 */
		this.__count = 0;

		/**
		 * When the progressor was activated or when it received its first sample
		 *
		 * @type {int}
		 * @private
		 */
		this.__startTime = 0;
		/**
		 * When the progressor was stopped or when it received its first sample
		 *
		 * @type {int}
		 * @private
		 */
		this.__endTime = 0;
		/**
		 * How many records were reported last time
		 *
		 * @type {number}
		 * @private
		 */
		this.__lastProgress = 0;
	}

	/**
	 * A sample was reported
	 * @param {int} count How may samples to count. Defaults to 1
	 * @private
	 */
	__recordSample( count = 1 ) {
		if ( !this.__started ) {
			this.__startMetering();
		}

		this.__count += count;
	}

	/**
	 * Start gathering metrics
	 * @private
	 */
	__startMetering() {
		if ( !this.__started ) {
			this.__startTime = Date.now();
			this.__started   = true;
		}
	}

	/**
	 * Stop gather metrics
	 * @private
	 */
	__endMetering() {
		if ( this.__started ) {
			this.__started = false;
			this.__endTime = Date.now();

			this.emit( "progressor:progress", this.__metrics );
		}
	}

	get __metrics() {
		const pkg = JSON.parse( JSON.stringify( measure ) );

		pkg.time            = Date.now();
		pkg.start           = this.__startTime;
		pkg.end             = this.__endTime;
		pkg.expected        = this.__expected;
		pkg.count           = this.__count;
		pkg.elapsed         = pkg.time - pkg.start;
		pkg.rate            = pkg.count / pkg.elapsed;
		this.__lastProgress = 0;

		return pkg;
	}

	/**
	 * Add a sample
	 * @private
	 */
	__sample( count = 1 ) {
		this.__recordSample( count );

		/*
		can't do this with % since count may be > 1 and so
		it could pass a threshold.
		 */
		if ( this.__lastProgress + count >= this.__threshold ) {
			this.emit( "progressor:progress", this.__metrics );
		}else{
			this.__lastProgress+= count;
		}
	}
};


