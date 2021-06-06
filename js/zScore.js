// javascript port of: https://stackoverflow.com/questions/22583391/peak-signal-detection-in-realtime-timeseries-data/48895639#48895639

function sum(a) {
    return a.reduce((acc, val) => acc + val)
}

function mean(a) {
    return sum(a) / a.length
}

function stddev(arr) {
    const arr_mean = mean(arr)
    const r = function(acc, val) {
        return acc + ((val - arr_mean) * (val - arr_mean))
    }
    return Math.sqrt(arr.reduce(r, 0.0) / arr.length)
}

function smoothedZScore(y, params) {

    //store parameters or empty object if null
    var p = params || {}
    
    // get cooefficients from parameters object or default value if null
    const lag = p.lag || 5
    const threshold = p.threshold || 3.5
    const influence = p.influece || 0.5

    //check if array is long enough for lag and new values - why is this +2 and not +1
    if (y === undefined || y.length < lag + 2) {
        throw ` ## y data array to short(${y.length}) for given lag of ${lag}`
    }
    //console.log(`lag, threshold, influence: ${lag}, ${threshold}, ${influence}`)

    // init variables
    var signals = Array(y.length).fill(0) // array of zeros the length of input data y
    var filteredY = y.slice(0)            // duplicate of input data
    const lead_in = y.slice(0, lag)       // lag window not including new value
    //console.log("1: " + lead_in.toString())

    //calculate mean and standard deviation for lag window
    var avgFilter = []
    avgFilter[lag - 1] = mean(lead_in)
    var stdFilter = []
    stdFilter[lag - 1] = stddev(lead_in)
    //console.log("2: " + stdFilter.toString())

    //for each new value
    for (var i = lag; i < y.length; i++) {
        //console.log(`${y[i]}, ${avgFilter[i-1]}, ${threshold}, ${stdFilter[i-1]}`)

        //if new value is greater than threshold value register signal
        if (Math.abs(y[i] - avgFilter[i - 1]) > (threshold * stdFilter[i - 1])) {
            if (y[i] > avgFilter[i - 1]) {
                signals[i] = +1 // positive signal
            } else {
                signals[i] = -1 // negative signal
            }

            //decrease influence of the signal value
            filteredY[i] = influence * y[i] + (1 - influence) * filteredY[i - 1] //why is this not just influence * y[i]
            
        //else new value not greater than threshold so no signal
        } else {
            signals[i] = 0 // no signal
            filteredY[i] = y[i] //new value has full influence on moving mean and standard deviation
        }

        // advance the lag window and update mean and standard deviation
        const y_lag = filteredY.slice(i - lag, i)
        avgFilter[i] = mean(y_lag)
        stdFilter[i] = stddev(y_lag)
    }

    return signals
}

export {smoothedZScore};