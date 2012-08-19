var series = [], seriesByName = {}, totalPoints = 60;
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
var plot = $.plot($("#netgraph-graph"), series, options);

function redraw()
{
	plot.setData(series);
	setupXaxis(plot.getXAxes()[0].options);
	// since the axes do change, we do need to call plot.setupGrid()
	plot.setupGrid();
	plot.draw();	
}

var serverUrl, handlerCallback, nextQueryTime;

function update()
{
	nextQueryTime = Date.now() + 1000;
	
	$.ajax(
		{
			url: serverUrl,
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

function defaultHandler(ajaxReply)
{
	var newCounterValues = parserFunction(ajaxReply);
	var newCountersByName = {};
	var timestamp = Date.now();

	for (var i = 0; i < newCounterValues.length; i++)
	{
		var counterValue = newCounterValues[i];
		newCountersByName[counterValue.name] = counterValue;
		
		var serie = seriesByName[counterValue.name];
		if (!serie)
		{
			serie = {name: counterValue.name, data: []};
			series.splice(i, 0, serie);
			seriesByName[counterValue.name] = serie;
		}
		
		serie.label = counterValue.label;
	}
	
	for (var i = 0; i < series.length; i++)
	{
		var serie = series[i];
		if (!serie)
		{
			serie = series[i] = {data: []};
		}

		var newValue;
		
		if (serie.name in newCountersByName)
		{
			newValue = newCountersByName[serie.name].value;
		}
		else
		{
			newValue = Number.NaN;
		}
		
		var data = serie.data;
		
		if (data.length > totalPoints)
		{
			data = data.slice(1);
		}
		
		data.push([timestamp, newValue]);
	}
	
	redraw();
}

handlerCallback = defaultHandler;

update();
