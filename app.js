/**
 * Created by Evan on 10/15/2016.
 */

// function to return a random subset of elements from a passed in array, 'set'
function randomSubset(set) {
    var subset = [];
    while(subset.length != 10) {
        var rand = Math.random() * set.length;
        var element = set.splice(rand, 1);
        subset.push(element[0]);
    }
    return subset;
}



// })();