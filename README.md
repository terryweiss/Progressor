# Progress Stream

A transform that you can insert anywhere in your chain to monitor what is 
happening in a stream.

# Installing
`npm install @terryweiss/ProgressStream`

# Constructor

`new ProgressStream(options)`

Creates a new instance of a Progress Stream. The result is a TransformStream that be 
piped. For instance:

```$JavaScript
const input = readFile();
const output = readFile();
const ps = new ProgressStream(options)

input.pipe(ps).pipe(output);
```  
## options

`options`:_object_ - The options for the stream. These are passed directly to the stream and any leftovers are used 
by this class.

`options`.`progressAt`:_number_ - Progress will be reported whenever the stream counter equals or exceeds 
since the last time progress was reported.  

`options`.`total`: _number_ - If this is none-zero the stream will calculate percent complete

# Events
`meter` - Raise this event tell the meter that something has happened and it should be counted
`start` - Raise this event to tell the stream to start monitoring
`stop` - Raise this event to tell the stream to stop monitoring
