/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 97.57617728531856, "KoPercent": 2.4238227146814406};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4888, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.5076923076923077, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "Vaccination"], "isController": true}, {"data": [0.6928571428571428, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.9130434782608695, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.046153846153846156, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9239130434782609, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.03076923076923077, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6357142857142857, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.005, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4968152866242038, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.875, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.8375796178343949, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.75, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.15714285714285714, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.6538461538461539, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.625, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.625, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7428571428571429, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8949044585987261, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.1, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1444, 35, 2.4238227146814406, 1664.4425207756253, 0, 20703, 461.5, 5193.0, 7665.75, 15362.999999999996, 2.7494916106232434, 95.7437261603226, 3.2936828990285383], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 100, 35, 35.0, 16033.650000000001, 90, 41653, 17434.0, 33590.8, 37598.44999999998, 41621.40999999998, 1.0156821321199316, 250.98688794042516, 3.0318210831488175], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 304.0, 304, 304, 304.0, 304.0, 304.0, 304.0, 3.289473684210526, 50.40861430921053, 1.998098273026316], "isController": false}, {"data": ["2.5 Select patient", 65, 0, 0.0, 1271.1384615384616, 304, 5339, 770.0, 2695.1999999999994, 4672.799999999999, 5339.0, 0.7705621547288807, 18.29499323535339, 0.53427649400147], "isController": false}, {"data": ["Vaccination", 100, 35, 35.0, 20147.180000000004, 90, 48600, 22821.0, 39337.200000000004, 41222.6, 48564.93999999998, 0.9491898664489858, 352.03662219217773, 13.238445615573358], "isController": true}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 2229.3571428571427, 350, 18677, 422.5, 9169.799999999997, 13070.500000000002, 18677.0, 0.8376412023741145, 12.035366221221041, 1.2106533003063373], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 276.0, 276, 276, 276.0, 276.0, 276.0, 276.0, 3.6231884057971016, 41.86834805253623, 2.200803894927536], "isController": false}, {"data": ["2.5 Select menacwy", 46, 0, 0.0, 383.3913043478262, 306, 604, 357.0, 559.1, 584.55, 604.0, 0.5084783233479981, 11.481555829676344, 0.35454445592819406], "isController": false}, {"data": ["2.3 Search by first/last name", 65, 0, 0.0, 6054.646153846154, 1263, 20703, 5535.0, 10894.399999999998, 16686.899999999994, 20703.0, 0.7303124613777063, 82.59643021162208, 0.6302456096985495], "isController": false}, {"data": ["2.5 Select td_ipv", 46, 0, 0.0, 381.5652173913044, 303, 660, 352.0, 574.7, 614.8, 660.0, 0.4315561351333602, 9.885396852806522, 0.30048781674813074], "isController": false}, {"data": ["4.0 Vaccination for hpv", 65, 0, 0.0, 1934.0000000000002, 1744, 2838, 1898.0, 2104.2, 2145.2999999999997, 2838.0, 0.37442611996612885, 18.733901251951337, 2.1779888114994903], "isController": true}, {"data": ["5.8 Consent confirm", 4, 0, 0.0, 898.0, 827, 1029, 868.0, 1029.0, 1029.0, 1029.0, 0.07202275919190464, 5.960270164121863, 0.15649476484569125], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 88.61428571428573, 84, 107, 88.0, 92.9, 97.25000000000001, 107.0, 1.172136637642331, 7.06372577235432, 0.7062581107669123], "isController": false}, {"data": ["5.9 Patient home page", 4, 0, 0.0, 350.75, 312, 378, 356.5, 378.0, 378.0, 378.0, 0.07917813100021774, 1.711782479116768, 0.05899698628238881], "isController": false}, {"data": ["2.4 Patient attending session", 65, 0, 0.0, 5964.0615384615385, 1345, 19964, 5323.0, 13452.6, 15027.299999999994, 19964.0, 0.7202375675915256, 68.61979022388307, 1.070509353392873], "isController": false}, {"data": ["5.4 Consent route", 4, 0, 0.0, 402.75, 395, 413, 401.5, 413.0, 413.0, 413.0, 0.07377079414259895, 0.8386024699384014, 0.11476257330972668], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 261.3714285714286, 247, 498, 257.0, 266.9, 271.9, 498.0, 1.1837721745894847, 6.109605412798268, 0.6415952704073867], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 1321.3857142857144, 421, 9372, 506.5, 3958.7, 5481.300000000001, 9372.0, 1.0088490473582568, 9.789973616795896, 1.587163882123195], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 3490.0, 3490, 3490, 3490.0, 3490.0, 3490.0, 3490.0, 0.28653295128939826, 2847.95509491404, 0.17936291189111747], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 46, 0, 0.0, 1901.9347826086957, 1741, 2479, 1889.5, 1995.0, 2254.65, 2479.0, 0.4249697440019216, 23.398101161853422, 2.518223609147936], "isController": true}, {"data": ["2.1 Open session", 100, 35, 35.0, 4225.810000000001, 91, 17196, 3714.5, 9819.100000000004, 12812.399999999994, 17172.70999999999, 1.0875357527378713, 13.642551892448152, 0.659849573414101], "isController": false}, {"data": ["4.3 Vaccination confirm", 157, 0, 0.0, 993.292993630573, 777, 1620, 963.0, 1179.2, 1238.0, 1490.0799999999972, 0.5009620385645044, 10.189227840406897, 1.1661651395833401], "isController": false}, {"data": ["5.6 Consent questions", 4, 0, 0.0, 441.5, 380, 571, 407.5, 571.0, 571.0, 571.0, 0.0731809948956256, 0.878850863993121, 0.14193110924093014], "isController": false}, {"data": ["4.1 Vaccination questions", 157, 0, 0.0, 475.3630573248408, 395, 1506, 426.0, 582.2, 591.2, 1002.5599999999891, 0.5225042931881414, 6.0601339364458395, 1.021913719814561], "isController": false}, {"data": ["5.3 Consent parent details", 4, 0, 0.0, 414.0, 395, 438, 411.5, 438.0, 438.0, 438.0, 0.07490075649764064, 0.8466930730844131, 0.13564790324694778], "isController": false}, {"data": ["5.2 Consent who", 4, 0, 0.0, 561.25, 400, 730, 557.5, 730.0, 730.0, 730.0, 0.0765023141950044, 1.4654227470068468, 0.12035666813296102], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 5553.5, 1413, 32287, 1817.5, 14559.999999999998, 22746.600000000006, 32287.0, 0.7814505955769896, 147.30725294299876, 3.7408349625182806], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 46, 0, 0.0, 1898.8478260869563, 1737, 2122, 1898.5, 2016.0, 2043.25, 2122.0, 0.5006911715084954, 26.039756902871353, 2.968198117237926], "isController": true}, {"data": ["2.5 Select hpv", 65, 0, 0.0, 874.7846153846153, 308, 4960, 547.0, 2025.1999999999998, 3903.999999999995, 4960.0, 0.7800686460408517, 15.622960758046709, 0.5812425555948924], "isController": false}, {"data": ["5.1 Consent start", 4, 0, 0.0, 588.25, 500, 803, 525.0, 803.0, 803.0, 803.0, 0.07892504094236498, 0.9015104896312228, 0.1677927872378209], "isController": false}, {"data": ["5.5 Consent agree", 4, 0, 0.0, 598.25, 418, 676, 649.5, 676.0, 676.0, 676.0, 0.07717538105344394, 1.2163036007138723, 0.11862700173644608], "isController": false}, {"data": ["Debug Sampler", 65, 0, 0.0, 0.20000000000000004, 0, 3, 0.0, 1.0, 1.0, 3.0, 0.7445675208192534, 1.4572985157332843, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 70, 0, 0.0, 1593.742857142857, 271, 14842, 347.5, 4377.4, 10273.400000000005, 14842.0, 0.7842170712853317, 8.524531465309598, 0.4686922340103741], "isController": false}, {"data": ["4.2 Vaccination batch", 157, 0, 0.0, 445.64968152866254, 384, 592, 418.0, 568.0, 574.4, 587.3599999999999, 0.5220473566780497, 10.517490352930615, 0.8340814470770337], "isController": false}, {"data": ["5.0 Consent for hpv", 4, 0, 0.0, 4689.25, 4363, 5002, 4696.0, 5002.0, 5002.0, 5002.0, 0.07899050139220759, 15.90765717258437, 1.1907586667390746], "isController": true}, {"data": ["5.7 Consent triage", 4, 0, 0.0, 434.5, 413, 448, 438.5, 448.0, 448.0, 448.0, 0.0723222680263253, 1.1566618979171186, 0.11674678617921458], "isController": false}, {"data": ["2.2 Session register", 65, 0, 0.0, 4875.753846153845, 668, 19747, 2847.0, 14728.0, 16965.8, 19747.0, 0.74848575574031, 94.90929828021004, 0.46122510925013244], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 0.14544547872340424, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404/Not Found", 35, 100.0, 2.4238227146814406], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1444, 35, "404/Not Found", 35, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 100, 35, "404/Not Found", 35, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
