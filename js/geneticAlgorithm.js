'use strict';

import { loadNavbar, navbarDropdown } from "./global.js";

//colors

var color0 = "rgb(000,000,000)";
var color1 = "rgb(030,030,030)";
var color2 = "rgb(037,037,037)";
var color3 = "rgb(060,060,060)";
var color4 = "rgb(071,071,071)";
var color5 = "rgb(000,128,000)";
var color5Faded = "rgb(000,64,000)";

//defaults

const OPTIMISATION_0 = 0;
const OPTIMISATION_1 = 1;
const COUNTING_ONES = 2;

const MINIMISATION = 0;
const MAXIMISATION = 1;

const DEFAULT_POPULATION_SIZE = 50;  //even for crossover
const DEFAULT_TOURNAMENT_SIZE = 2;
const DEFAULT_CROSS_RATE = 0.75;
const DEFAULT_NUM_OF_RUNS = 10;
const DEFAULT_NUM_OF_GENERATIONS = 50;

const DEFAULT_COUNTING_ONES_FITNESS_FUNCTION = COUNTING_ONES;
const DEFAULT_COUNTING_ONES_PROBLEM_TYPE = MAXIMISATION;
const DEFAULT_COUNTING_ONES_GENE_SIZE = 50;
const DEFAULT_COUNTING_ONES_GENE_MIN = 0;
const DEFAULT_COUNTING_ONES_GENE_MAX = 1;
const DEFAULT_COUNTING_ONES_MUTATE_RATE = 0.02;
const DEFAULT_COUNTING_ONES_MUTATE_MAX = 0.5;

const DEFAULT_OPTIMISATION_0_FITNESS_FUNCTION = OPTIMISATION_0;
const DEFAULT_OPTIMISATION_0_PROBLEM_TYPE = MINIMISATION;
const DEFAULT_OPTIMISATION_0_GENE_SIZE = 20;
const DEFAULT_OPTIMISATION_0_GENE_MIN = -100;
const DEFAULT_OPTIMISATION_0_GENE_MAX = 100;
const DEFAULT_OPTIMISATION_0_MUTATE_RATE = 0.02;
const DEFAULT_OPTIMISATION_0_MUTATE_MAX = 0.1;

const DEFAULT_OPTIMISATION_1_FITNESS_FUNCTION = OPTIMISATION_1;
const DEFAULT_OPTIMISATION_1_PROBLEM_TYPE = MINIMISATION;
const DEFAULT_OPTIMISATION_1_GENE_SIZE = 20;
const DEFAULT_OPTIMISATION_1_GENE_MIN = 0;
const DEFAULT_OPTIMISATION_1_GENE_MAX = Math.PI;
const DEFAULT_OPTIMISATION_1_MUTATE_RATE = 0.01;
const DEFAULT_OPTIMISATION_1_MUTATE_MAX = 0.2;

//parameters

var populationSize;
var tournamentSize;
var crossRate;
var numOfRuns;
var numOfGenerations;

var fitnessFunction;
var problemType;
var mutateRate;
var geneSize;
var geneMin;
var geneMax;
var mutateMax;
var fitnessSuggestedMax;

let population = [];
let offspring = [];

//output

var generations = [];

var chart;
const chartData = {
    datasets: [{
        label: 'Average Fitness',
        backgroundColor: 'rgb(128, 0, 0)',
        borderColor: 'rgb(128, 0, 0)',
        borderWidth: 3,
        pointRadius: 0.5,
        pointHitRadius: 4,
        data: []
    },
    {
        label: 'Best Fitness',
        backgroundColor: 'rgb(128, 128, 0)',
        borderColor: 'rgb(128, 128, 0)',
        borderWidth: 3,
        pointRadius: 0.5,
        pointHitRadius: 4,
        data: []
    }]
};
const chartConfig = {
    type: 'line',
    data: chartData,
    options: {
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: color5
                }
            },
            autocolors: false
        },
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                grid: { color: "rgb(045,045,045)", borderColor: color5 },
                ticks: { color: color5 },
                type: 'linear',
                title: {
                    display: true,
                    text: "Generation",
                    color: color5
                }
            },
            y: {
                grid: { color: "rgb(045,045,045)", borderColor: color5 },
                ticks: { color: color5 },
                title: {
                    display: true,
                    text: "Fitness",
                    color: color5
                }
            }
        }
    }
};

var chart2;
const chart2Data = {
    datasets: [{
        label: 'total Fitness',
        backgroundColor: 'rgb(0, 0, 128)',
        borderColor: 'rgb(0, 0, 128)',
        borderWidth: 3,
        pointRadius: 0.5,
        pointHitRadius: 4,
        data: []
    }]
};
const chart2Config = {
    type: 'line',
    data: chart2Data,
    options: {
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: color5
                }
            },
            autocolors: false
        },
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                grid: { color: "rgb(045,045,045)", borderColor: color5 },
                ticks: { color: color5 },
                type: 'linear',
                title: {
                    display: true,
                    text: "Generation",
                    color: color5
                }
            },
            y: {
                grid: { color: "rgb(045,045,045)", borderColor: color5 },
                ticks: { color: color5 },
                title: {
                    display: true,
                    text: "Fitness",
                    color: color5
                }
            }
        }
    }
};

var runTime;

//inclusive exclusive
function randInt(min, max){
    return min + Math.floor( (max - min)*Math.random() );
}

function randDecimal(min, max) {
    return min + ( (max-min)*Math.random() );
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function $(val) { return document.getElementById(val); }

window.onload = function () {

    loadNavbar().then( () => {
        $("navbarIcon").addEventListener("click", navbarDropdown);
        $("geneticAlgorithm").className = "active";
    });

    setDefaults();

    $("fitnessFunction").addEventListener("change",setFitnessFunctionParameters);
    $("reset").addEventListener("click",setDefaults);
    $("start").addEventListener("click",start);
    $("logClear").addEventListener("click", function(){ $("log").textContent = ""; });

    chart = new Chart( document.getElementById('chart'),chartConfig );
    chart2 = new Chart( document.getElementById('chart2'),chart2Config );
}

function log(val) {
    $("log").textContent += val + "\n";
    //this feels dirty...
    requestAnimationFrame(() => { // fires before next repaint
        requestAnimationFrame(() => { // fires before the _next_ next repaint which is effectively _after_ the next repaint
            $("log").scrollTop = 99999999;
        });
    });
}

function setDefaults() {[]
    $("populationSize").value = DEFAULT_POPULATION_SIZE;  //even for crossover
    $("tournamentSize").value = DEFAULT_TOURNAMENT_SIZE;
    $("crossRate").value = DEFAULT_CROSS_RATE;
    $("numOfRuns").value = DEFAULT_NUM_OF_RUNS;
    $("numOfGenerations").value = DEFAULT_NUM_OF_GENERATIONS;
    
    $("fitnessFunction").selectedIndex = fitnessFunction =  DEFAULT_OPTIMISATION_0_FITNESS_FUNCTION;
    $("problemType").value = DEFAULT_OPTIMISATION_0_PROBLEM_TYPE;
    $("geneSize").value = DEFAULT_OPTIMISATION_0_GENE_SIZE;
    $("geneMin").value =  DEFAULT_OPTIMISATION_0_GENE_MIN;
    $("geneMax").value = DEFAULT_OPTIMISATION_0_GENE_MAX;
    $("mutateRate").value = DEFAULT_OPTIMISATION_0_MUTATE_RATE;
    $("mutateMax").value = DEFAULT_OPTIMISATION_0_MUTATE_MAX;
}

function setFitnessFunctionParameters() {
    if ($("fitnessFunction").selectedIndex == COUNTING_ONES) {
        $("fitnessFunction").selectedIndex =  DEFAULT_COUNTING_ONES_FITNESS_FUNCTION;
        $("problemType").value = DEFAULT_COUNTING_ONES_PROBLEM_TYPE;
        $("geneSize").value = DEFAULT_COUNTING_ONES_GENE_SIZE;
        $("geneMin").value =  DEFAULT_COUNTING_ONES_GENE_MIN;
        $("geneMax").value = DEFAULT_COUNTING_ONES_GENE_MAX;
        $("mutateRate").value = DEFAULT_COUNTING_ONES_MUTATE_RATE;
        $("mutateMax").value = DEFAULT_COUNTING_ONES_MUTATE_MAX;
    }
    else if ($("fitnessFunction").selectedIndex == OPTIMISATION_0) {
        $("fitnessFunction").selectedIndex =  DEFAULT_OPTIMISATION_0_FITNESS_FUNCTION;
        $("problemType").value = DEFAULT_OPTIMISATION_0_PROBLEM_TYPE;
        $("geneSize").value = DEFAULT_OPTIMISATION_0_GENE_SIZE;
        $("geneMin").value =  DEFAULT_OPTIMISATION_0_GENE_MIN;
        $("geneMax").value = DEFAULT_OPTIMISATION_0_GENE_MAX;
        $("mutateRate").value = DEFAULT_OPTIMISATION_0_MUTATE_RATE;
        $("mutateMax").value = DEFAULT_OPTIMISATION_0_MUTATE_MAX;
    }
    else if ($("fitnessFunction").selectedIndex == OPTIMISATION_1) {
        $("fitnessFunction").selectedIndex = fitnessFunction =  DEFAULT_OPTIMISATION_1_FITNESS_FUNCTION;
        $("problemType").value = DEFAULT_OPTIMISATION_1_PROBLEM_TYPE;
        $("geneSize").value = DEFAULT_OPTIMISATION_1_GENE_SIZE;
        $("geneMin").value =  DEFAULT_OPTIMISATION_1_GENE_MIN;
        $("geneMax").value = DEFAULT_OPTIMISATION_1_GENE_MAX;
        $("mutateRate").value = DEFAULT_OPTIMISATION_1_MUTATE_RATE;
        $("mutateMax").value = DEFAULT_OPTIMISATION_1_MUTATE_MAX;
    }
}

function start() {

    //parameters
    populationSize = $("populationSize").valueAsNumber;
    tournamentSize = $("tournamentSize").valueAsNumber;
    crossRate = $("crossRate").valueAsNumber;
    numOfRuns = $("numOfRuns").valueAsNumber;
    numOfGenerations = $("numOfGenerations").valueAsNumber;
    
    fitnessFunction = $("fitnessFunction").selectedIndex;
    problemType = $("problemType").selectedIndex;
    mutateRate = $("mutateRate").valueAsNumber;
    geneSize = $("geneSize").valueAsNumber;
    geneMin = $("geneMin").valueAsNumber;
    geneMax = $("geneMax").valueAsNumber;
    mutateMax = $("mutateMax").valueAsNumber;
    fitnessSuggestedMax = $("fitnessSuggestedMax").valueAsNumber;

    if (isNaN(fitnessSuggestedMax)) delete chart.config.options.scales.y.suggestedMax;
    else chart.config.options.scales.y.suggestedMax = fitnessSuggestedMax;

    //clear output
    generations = [];
    for (var g = 0; g < numOfGenerations; g++) {
        generations.push({
            averageFitness: 0,
            bestFitness: 0,
            totalFitness: 0
        });
    }
    chart.config._config.data.datasets[0].data = []; //average
    chart.config._config.data.datasets[1].data = []; //best
    chart2.config._config.data.datasets[0].data = []; //total

    log("start");
    runTime = Date.now();
    for (var r = 0; r < numOfRuns; r++) {

        init();
        fitnessPopulation();

        for (var g = 0; g < numOfGenerations; g++) {

            selection();
            cross();
            mutate();
            fitnessOffspring();
            
            var averageFitness = 0;
            var bestFitness;
            var totalFitness = 0;
            if (problemType == MINIMISATION) { //minimisation
                bestFitness = Number.MAX_VALUE;
                for (var p = 0; p < populationSize; p++) {
                    totalFitness += offspring[p].fitness;
                    if (offspring[p].fitness < bestFitness) {
                        bestFitness = offspring[p].fitness;
                    }
                }
            }
            else if (problemType == MAXIMISATION) { //maximisation
                bestFitness = 0;
                for (var p = 0; p < populationSize; p++) {
                    totalFitness += offspring[p].fitness;
                    if (offspring[p].fitness > bestFitness) {
                        bestFitness = offspring[p].fitness;
                    }
                }
            }
            averageFitness = totalFitness/populationSize;
            generations[g].averageFitness += averageFitness;
            generations[g].bestFitness += bestFitness;
            generations[g].totalFitness += totalFitness;

            population = [];
            for (var p = 0; p < populationSize; p++) {
                population.push({
                    gene: [...offspring[p].gene],
                    fitness: offspring[p].fitness
                });
            }
        }
    }
    runTime = Date.now() - runTime + " ms";
    log("finish");

    for (var g = 0; g < numOfGenerations; g++) {
        generations[g].averageFitness /= numOfRuns;
        generations[g].bestFitness /= numOfRuns;
        generations[g].totalFitness /= numOfRuns;
    }

    //display output
    $("runTime").textContent = runTime;
    var v = numberWithCommas(generations[numOfGenerations-1].bestFitness.toFixed(0));
    $("bestFitness").textContent = v;
    for (var g = 0; g < numOfGenerations; g++) {
        chart.config._config.data.datasets[0].data.push({
            x: g,
            y: generations[g].averageFitness
        });
        chart.config._config.data.datasets[1].data.push({
            x: g,
            y: generations[g].bestFitness
        });
        chart2.config._config.data.datasets[0].data.push({
            x: g,
            y: generations[g].totalFitness
        });
    }
    chart.update("resize");
    chart2.update("resize");
}

function init() {
    population = [];
    for (var i = 0; i < populationSize; i++) {
        population.push({
            gene: [],
            fitness: 0
        });
        for(var j = 0; j < geneSize; j++) {
            //binary
            //population[i].gene.push(Math.round(Math.random()));

            //real
            population[i].gene.push(randDecimal(geneMin, geneMax));
        }
    }
}

function fitnessPopulation() {

    //maximisation - counting ones
    if (fitnessFunction == COUNTING_ONES) {
        for (var p = 0; p < populationSize; p++) {
            population[p].fitness = 0;
            for (var g = 0; g < geneSize; g++){
                //binary
                // if (population[p].gene[g] == 1){
                //     population[p].fitness++;
                // }
    
                //real
                population[p].fitness += population[p].gene[g];
            }
        }
    }

    //minimisation - optimisation 1
    else if (fitnessFunction == OPTIMISATION_0) {
        for (var p = 0; p < populationSize; p++) {
            population[p].fitness = 0;
            for (var g = 0; g < geneSize; g++){
                var gVal = population[p].gene[g];
                population[p].fitness += ( 100 * ((gVal-1)-(gVal*gVal)) ) + ((1-gVal)*(1-gVal));
            }
        }
    }
    
    //minimisation - optimisation 2
    else if (fitnessFunction == OPTIMISATION_1) {
        for (var p = 0; p < populationSize; p++) {
            population[p].fitness = 0;
            for (var g = 0; g < geneSize; g++){
                var gVal = population[p].gene[g];
                population[p].fitness -= Math.sin(gVal) * Math.pow(Math.sin((g*(gVal*gVal))/Math.PI), 20);
            }
        }
    }
}

function fitnessOffspring() {

    //maximisation - counting ones
    if (fitnessFunction == COUNTING_ONES) {
        for (var p = 0; p < populationSize; p++) {
            offspring[p].fitness = 0;
            for (var g = 0; g < geneSize; g++){
                //binary
                // if (offspring[p].gene[g] == 1){
                //     offspring[p].fitness++;
                // }
    
                //real
                offspring[p].fitness += offspring[p].gene[g];
            }
        }
    }

    //minimisation - optimisation 1
    else if (fitnessFunction == OPTIMISATION_0) {
        for (var p = 0; p < populationSize; p++) {
            offspring[p].fitness = 0;
            for (var g = 0; g < geneSize; g++){
                var gVal = offspring[p].gene[g];
                offspring[p].fitness += ( 100 * ((gVal-1)-(gVal*gVal)) ) + ((1-gVal)*(1-gVal));
            }
        }
    }
    
    //minimisation - optimisation 2
    else if (fitnessFunction == OPTIMISATION_1) {
        for (var p = 0; p < populationSize; p++) {
            offspring[p].fitness = 0;
            for (var g = 0; g < geneSize; g++){
                var gVal = offspring[p].gene[g];
                offspring[p].fitness -= Math.sin(gVal) * Math.pow(Math.sin((g*(gVal*gVal))/Math.PI), 20);
            }
        }
    }
}

function selection() {

    offspring = [];

    //maximisation
    if (problemType == MAXIMISATION) {
        for (var p = 0; p < populationSize; p++) {
            var bestIndex = randInt(0, populationSize);
            for (var t = 1; t < tournamentSize; t++) {
                var currentIndex = randInt(0, populationSize);
                if (population[currentIndex].fitness > population[bestIndex].fitness){
                    bestIndex = currentIndex;
                }
            }
            offspring.push({
                gene: [...population[bestIndex].gene],
                fitness: population[bestIndex].fitness
            });
        }
    }

    ///minimisation
    else if (problemType == MINIMISATION) {
        for (var p = 0; p < populationSize; p++) {
            var bestIndex = randInt(0, populationSize);
            for (var t = 1; t < tournamentSize; t++) {
                var currentIndex = randInt(0, populationSize);
                if (population[currentIndex].fitness < population[bestIndex].fitness){
                    bestIndex = currentIndex;
                }
            }
            offspring.push({
                gene: [...population[bestIndex].gene],
                fitness: population[bestIndex].fitness
            });
        }
    }
}

function cross() {
    for (var p = 0; p < populationSize; p = p+2){
        if (Math.random() < crossRate) {
            var crossPoint = randInt(0, geneSize);
            for (var g = crossPoint; g < geneSize; g++) {
                var temp = offspring[p].gene[g];
                offspring[p].gene[g] = offspring[p+1].gene[g];
                offspring[p+1].gene[g] = temp;
            }
        }
    }
}

function mutate() {
    for (var p = 0; p < populationSize; p++) {
        for (var g = 0; g < geneSize; g++) {
            if (Math.random() < mutateRate) {
                //binary
                // if (offspring[p].gene[g] == 0) offspring[p].gene[g] = 1;
                // else offspring[p].gene[g] = 0;

                //real
                var alter = Math.random() * mutateMax;
                if (Math.random() < 0.5) {
                    offspring[p].gene[g] += alter;
                    if (offspring[p].gene[g] > geneMax) offspring[p].gene[g] = geneMax;
                }
                else {
                    offspring[p].gene[g] -= alter;
                    if (offspring[p].gene[g] < geneMin) offspring[p].gene[g] = geneMin;
                }
            }
        }
    }
}