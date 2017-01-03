class Stopwatch

	config : {
		accuracy : 1000
	}
	value : 0
	laps : []
	interval = null

	constructor: (@config = @config) ->


	start : () ->
		interval = setInterval @update, @config.accuracy

	stop : () ->
		clearInterval interval
		interval = null

	reset : () ->
		@stop() if interval?
		@laps = []
		@value = 0 

	lap : () ->
		@laps.push(@value)

	running : () ->
		if interval? then true else false

	update : () =>
		@value++

module.exports = Stopwatch if module?
@Stopwatch = Stopwatch if not ender?
if typeof define is "function" and define.amd
	define "Stopwatch", [], ->
		Stopwatch