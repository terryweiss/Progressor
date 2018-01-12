"use strict";

import assert from "assert";
import fs from "fs";
import ProgressStream from "./ProgressStream";
import {Writable} from "stream";

class Sink extends Writable {

	_write( chunk, enc, callback ) {
		return callback();
	}
}

const input = fs.createReadStream( "e:\\WDIData.csv" );

const ps = new ProgressStream( { threshold: 5263330, reportChunks:true } );

ps.on( "progressor:progress", ( metrics ) => {
	console.info( metrics );
} );
input.on( "close", () => {
	console.info( "PAPAPAPAPAAPAPAPAPAPA" );
	ps.__endMetering();
} );
const s = new Sink();
input.pipe( ps ).pipe( s );


