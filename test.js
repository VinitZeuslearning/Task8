function performBinarySearch(arr, num) {
    let i = 0;
    let j = arr.length - 1;


    let mid;
    while (i < j) {
        mid = Math.trunc(  i + ((j - i) / 2) );

        if (arr[mid] > num) {
            j = mid - 1;
        }
        else {
            i = mid;
        }
    }


    return i;
};



console.log( performBinarySearch( [ 5 , 8, 10, 11, 15, 24, 50 ], 16 ) );