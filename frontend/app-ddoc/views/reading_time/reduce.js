function(keys, values, rereduce) {
    if (rereduce) {
        var result = {
            'sum': values.reduce(function(a, b) { return a + b.sum; }, 0),
            'min': values.reduce(function(a, b) { return Math.min(a, b.min); }, Infinity),
            'max': values.reduce(function(a, b) { return Math.max(a, b.max); }, -Infinity),
            'count': values.reduce(function(a, b) { return a + b.count; }, 0)
        };

        result.avg = Math.round((result.sum / result.count)*10)/10; // Round to 1 decimal point.

        return result;

    } else {
        return {
            'sum': sum(values),
            'min': Math.min.apply(null, values),
            'max': Math.max.apply(null, values),
            'count': values.length,
            'avg': Math.round((sum(values) / values.length)*10)/10 // Round to 1 decimal point.
        };
    }
}
