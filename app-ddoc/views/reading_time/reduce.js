function(keys, values, rereduce) {
    if (rereduce) {
        var result = {
            'sum': values.reduce(function(a, b) { return a + b.sum; }, 0),
            'min': values.reduce(function(a, b) { return Math.min(a, b.min); }, Infinity),
            'max': values.reduce(function(a, b) { return Math.max(a, b.max); }, -Infinity),
            'count': values.reduce(function(a, b) { return a + b.count; }, 0)
        };

        result.avg = result.sum / result.count;

        return result;

    } else {
        return {
            'sum': sum(values),
            'min': Math.min.apply(null, values),
            'max': Math.max.apply(null, values),
            'count': values.length,
            'avg': sum(values) / values.length
        };
    }
}
