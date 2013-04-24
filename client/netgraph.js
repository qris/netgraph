var allSeries = [], seriesByName = {}, visibleSeries;

visibleSeries = visibleSeries || allSeries;

var totalPoints = 60;
var options = {
	series: {
		lines: { show: true },
		points: { show: true },
		shadowSize: 0 // drawing is faster without shadows
	},
	xaxis: { mode: "time" },
	yaxis: { min: 0 },
	grid: {
		backgroundColor: { colors: ["#fff", "#eee"] }
	}	
};

function setupXaxis(xaxis)
{
	xaxis.max = Date.now();
	xaxis.min = xaxis.max - (totalPoints * 1000);
}

setupXaxis(options.xaxis);    
var plot = $.plot($("#netgraph-graph"), allSeries, options);

function defaultPostProcessSeries(seriesIn)
{
	// exclude series with no data at all by renumbering
	var seriesToPlot = [];
	for (var i = 0; i < seriesIn.length; i++)
	{
		var serie = seriesIn[i];
		if (serie)
		{
			var flotSeries = serie.data;
			seriesToPlot.push(flotSeries);
		}
	}
	return seriesToPlot;
}

var postProcessSeriesFunction = defaultPostProcessSeries;

function redraw()
{
	plot.setData(postProcessSeriesFunction(visibleSeries));
	setupXaxis(plot.getXAxes()[0].options);
	// since the axes do change, we do need to call plot.setupGrid()
	plot.setupGrid();
	plot.draw();	
}

var serverUrl;

function defaultUrlFunction()
{
	return serverUrl;
}

var urlFunction = defaultUrlFunction, handlerCallback, nextQueryTime;

function update()
{
	nextQueryTime = Date.now() + 1000;
	
	$.ajax(
		{
			url: urlFunction(),
		}).done(function (ajaxReply)
		{
			handlerCallback(ajaxReply);
			
			var timeNow = Date.now();
			if (timeNow > nextQueryTime)
			{
				setTimeout(update, 0);
			}
			else
			{
				setTimeout(update, nextQueryTime - timeNow);
			}
		});
}

var parserFunction;

function getOrCreateSeries(name, index)
{
	var serie;
	
	if (name)
	{
		serie = seriesByName[name];
	}
	else
	{
		serie = allSeries[index];
	}
	
	if (!serie)
	{
		serie = {name: name, data: [], total: 0};
		allSeries[index]   = serie;
		seriesByName[name] = serie;
	}
	return serie;
}

var previousCounterValues = {};

function absoluteToRelativeValue(name, absoluteValue)
{
	var relativeValue;
	
	if (name in previousCounterValues)
	{
		relativeValue = absoluteValue -
			previousCounterValues[name];
	}
	else
	{
		relativeValue = Number.NaN;
	}
	
	previousCounterValues[name] = absoluteValue;
	return relativeValue;
}

function Counter(name, value, label)
{
	this.name = name;
	this.value = value;
	this.label = label;
}

function DeriveCounter(name, absoluteValue, label)
{
	this.name = name;
	this.value = absoluteToRelativeValue(name, absoluteValue);
	this.label = label;
}

function defaultHandler(ajaxReply)
{
	var counters = parserFunction(ajaxReply);
	var newCountersByName = {};
	var timestamp = Date.now();

	for (var i = 0; i < counters.length; i++)
	{
		var counter = counters[i];
		
		if (counter)
		{
			var countersWithThisName = newCountersByName[counter.name];
			if (!countersWithThisName)
			{
				countersWithThisName = newCountersByName[counter.name] = [];
			}
			countersWithThisName.push(counter);
			
			var serie = getOrCreateSeries(counter.name, i);
			counter.serie = serie;
			countersWithThisName = null;
		}
	}
	
	for (var i = 0; i < allSeries.length; i++)
	{
		var serie = allSeries[i];
		if (serie)
		{
			var newValue = Number.NaN;
			
			var counters = newCountersByName[serie.name];
			if (counters)
			{
				newValue = 0;
				for (var j = 0; j < counters.length; j++)
				{
					newValue += counters[j].value;
				}
				serie.counters = counters;
				serie.total += newValue;
				serie.label = counters[0].label;
			}
			
			if (serie.data.length >= totalPoints)
			{
				serie.total -= serie.data[0];
				serie.data = serie.data.slice(1);
			}
			
			serie.data.push([timestamp, newValue]);
		}
	}
	
	redraw();
}

handlerCallback = defaultHandler;

$(document).ready(update);
