'use strict';

import { loadNavbar, navbarDropdown } from "./global.js";
import { smoothedZScore } from "./zScore.js";

//colors

var color0 = "rgb(000,000,000)";
var color1 = "rgb(030,030,030)";
var color2 = "rgb(037,037,037)";
var color3 = "rgb(060,060,060)";
var color4 = "rgb(071,071,071)";
var color5 = "rgb(000,128,000)";
var color5Faded = "rgb(000,64,000)";

//settings

var lag = 5;
var threshold = 3.5;
var influence = 0.5;

//peak detection variables

var lead_in = [];   //lag window of values which will be used to calculate mean and standard deviation used for determining if the new data point is a signal
var stdFilter = [];

//chart input data

var chartInputData;

const chartInputDataData = {
    datasets: [{
        label: 'Data',
        backgroundColor: 'rgb(128, 0, 0)',
        borderColor: 'rgb(128, 0, 0)',
        borderWidth: 3,
        pointRadius: 0.5,
        pointHitRadius: 4,
        data: []
    },
    {
        label: 'Mean',
        backgroundColor: 'rgb(0, 128, 0)',
        borderColor: 'rgb(0, 128, 0)',
        borderWidth: 3,
        pointRadius: 0.5,
        pointHitRadius: 4,
        data: []
    },
    {
        label: 'Z-score +',
        backgroundColor: 'rgb(071,071,071)',
        borderColor: 'rgb(0, 0, 128)',
        borderWidth: 3,
        pointRadius: 0.5,
        pointHitRadius: 4,
        data: [],
        fill: 3,
    },
    {
        label: 'Z-score -',
        backgroundColor: 'rgb(128, 128, 0)',
        borderColor: 'rgb(128, 128, 0)',
        borderWidth: 3,
        pointRadius: 0.5,
        pointHitRadius: 4,
        data: [],
    }]
};

const chartInputDataConfig = {
    type: 'line',
    data: chartInputDataData,
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Input Data'
            }
        },
        onClick: function (element, dataAtClick) {

            var dataSet_data = this.data.datasets[0];
            var dataSet_mean = this.data.datasets[1];
            var dataSet_zUpper = this.data.datasets[2];
            var dataSet_zLower = this.data.datasets[3];

            //new data point
            var xPixel = element.x;
            var yPixel = element.y;
            var newDataPointX = this.scales["x"].getValueForPixel(xPixel);
            var newDataPointY = this.scales["y"].getValueForPixel(yPixel);

            //add data point to graph
            dataSet_data.data.push({ x: newDataPointX, y: newDataPointY });

            //check if array is long enough for lag and new value
            if (dataSet_data.data.length > lag) {

                //get lag window last index
                var lagIndexLast = dataSet_data.data.length - 2;

                //calculate mean and standard deviation for lag window and add to graph
                var mean = lead_in.reduce((acc, val) => acc + val) / lead_in.length;
                dataSet_mean.data.push({ x: dataSet_data.data[lagIndexLast]["x"], y: mean });
                stdFilter[lagIndexLast] = Math.sqrt(lead_in.reduce((acc, val)=>(acc+((val-mean)*(val-mean))),0.0) / lead_in.length);
                dataSet_zUpper.data.push({ x: dataSet_data.data[lagIndexLast]["x"], y: mean + (stdFilter[lagIndexLast] * threshold) });
                dataSet_zLower.data.push({ x: dataSet_data.data[lagIndexLast]["x"], y: mean - (stdFilter[lagIndexLast] * threshold) });

                //if new value is a signal
                if (Math.abs(newDataPointY - dataSet_mean.data[lagIndexLast-(lag-1)]["y"]) > (threshold * stdFilter[lagIndexLast])) {
                    if (newDataPointY > dataSet_mean.data[lagIndexLast-(lag-1)]["y"]) {
                        chartOutputSignal.config._config.data.datasets[0].data.push({x: newDataPointX, y: 1}); //register positive signal
                    }
                    else {
                        chartOutputSignal.config._config.data.datasets[0].data.push({x: newDataPointX, y: -1}); //register negative signal
                    }

                    //increment lag window with signal data point value with decreased influence
                    lead_in.shift();
                    lead_in.push((influence * newDataPointY) + ((1 - influence) * lead_in[lead_in.length - 1])); //0.3 influence would be 30% new val + 70% last val
                }

                //else new value not a signal, increment lag window
                else {
                    lead_in.shift(0);
                    lead_in.push(newDataPointY);
                    chartOutputSignal.config._config.data.datasets[0].data.push({x: newDataPointX, y: 0});
                }
            }

            //else increment lag
            else {
                lead_in.push(newDataPointY);
                chartOutputSignal.config._config.data.datasets[0].data.push({x: newDataPointX, y: 0});
            }

            //update charts
            this.update('resize');
            chartOutputSignal.update('resize');
        },
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                grid: { color: color5Faded, borderColor: color5 },
                ticks: { color: color5 },
                type: 'linear',
                //grace: '5%',
                suggestedMin: 0,
                suggestedMax: 50
            },
            y: {
                grid: { color: color5Faded, borderColor: color5 },
                ticks: { color: color5, stepSize: 1 },
                suggestedMin: 0,
                suggestedMax: 5,
            }
        }
    }
};

//chart output signal

var chartOutputSignal;

const chartOutpuSignaltData = {
    datasets: [{
        label: 'Signal',
        backgroundColor: 'rgb(128, 0, 0)',
        borderColor: 'rgb(128, 0, 0)',
        borderWidth: 3,
        pointRadius: 0.5,
        pointHitRadius: 4,
        data: [],
        stepped: true
    }]
}

const chartOutputSignalConfig = {
    type: 'line',
    data: chartOutpuSignaltData,
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Output Signal'
            }
        },
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                grid: { color: color5Faded, borderColor: color5 },
                ticks: { color: color5 },
                type: 'linear',
                //grace: '5%',
                suggestedMin: 0,
                suggestedMax: 50
            },
            y: {
                grid: { color: color5Faded, borderColor: color5 },
                ticks: { color: color5, stepSize: 1 },
                suggestedMin: -2,
                suggestedMax: 2,
            }
        }
    }
}

window.onload = async function () {

    //load navbar
    loadNavbar().then(() => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
        document.getElementById("peakDetection").className = "active";
    });

    //draw chart input data
    chartInputData = new Chart(
        document.getElementById('chartInputData'),
        chartInputDataConfig
    );

    //draw chart output signal
    chartOutputSignal = new Chart(
        document.getElementById('chartOutputSignal'),
        chartOutputSignalConfig
    );

    //controls events
    document.getElementById("lag").addEventListener("focusout", changeSetting);
    document.getElementById("threshold").addEventListener("focusout", changeSetting);
    document.getElementById("influence").addEventListener("focusout", changeSetting);
    document.getElementById("reset").addEventListener("click", reset);
}
function reset() {
    
    lead_in = []; 
    stdFilter = [];

    chartInputData.config._config.data.datasets[0].data = [];
    chartInputData.config._config.data.datasets[1].data = [];
    chartInputData.config._config.data.datasets[2].data = [];
    chartInputData.config._config.data.datasets[3].data = [];
    chartInputData.update('resize');

    chartOutputSignal.config._config.data.datasets[0].data = [];
    chartOutputSignal.update('resize');
}

function changeSetting(event) {

    //error checking
    if ( event.originalTarget.value != "" && isNaN(event.originalTarget.valueAsNumber) || event.originalTarget.valueAsNumber < 0)
        event.originalTarget.style.borderColor = "rgb(128,000,000)";
    else event.originalTarget.style.borderColor = "";

    if (event.originalTarget.id == "lag")
        lag = event.originalTarget.valueAsNumber;
    else if (event.originalTarget.id == "threshold") 
        threshold = event.originalTarget.valueAsNumber;
    else if (event.originalTarget.id == "influence") 
        influence = event.originalTarget.valueAsNumber;
    
}