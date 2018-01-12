/**
 * A transform that you can insert anywhere in your chain to monitor what is
 * happening in a stream.
 * @module ProgressStream
 */

"use strict";

import { mix } from "mixwith";
import Progressor from "./Progressor";
import { Transform } from "stream";

/**
 * A stream that reports its progress
 */
export default class  extends mix( Transform ).with( Progressor ) {
	/**
	 * @param {object} options The options for the stream. These are passed directly to the stream and any leftovers are used by this class.
	 * @param {number} options.threshold How many records pass before progress is reported
	 * @param {number} options.expected The expected number of rows to be processed. If 0, then percentages will not be calculated
	 *
	 * @param options
	 */
	constructor( options = {} ) {
		super( options );

		this._reportChunks = options.reportChunks;

		this.on( "end", this.__endMetering );
		this.on( "close", this.__endMetering );
	}

	_sample( chunk ) {
		if ( this._reportChunks && chunk && chunk.length ) {
			this.__sample( chunk.length );
		} else {
			this.__sample();
		}

	}

	_transform( chunk, enc, callback ) {

		this._sample( chunk );
		this.push( chunk, enc );

		return callback();
	}
}
