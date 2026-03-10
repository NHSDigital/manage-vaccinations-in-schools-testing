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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8517329910141207, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [1.0, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.504950495049505, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.9838709677419355, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9833333333333333, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9428571428571428, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.995049504950495, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}, {"data": [1.0, 500, 1500, "7.7 Partial name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 648, 0, 0.0, 255.8657407407406, 3, 4196, 168.0, 360.1, 719.6999999999966, 1941.02, 0.18020503328231233, 81.544854033054, 1.218918596773579], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 30, 0, 0.0, 101.09999999999998, 84, 174, 95.5, 111.80000000000001, 161.35, 174.0, 0.00865855340970947, 3.929258301821009, 0.0645267982408417], "isController": false}, {"data": ["7.7 Last name search", 30, 0, 0.0, 163.8, 151, 191, 160.0, 179.9, 189.9, 191.0, 0.008658068627315168, 3.9289030248694363, 0.06454657802824608], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 53.0, 53, 53, 53.0, 53.0, 53.0, 53.0, 18.867924528301884, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 101, 0, 0.0, 696.9801980198021, 422, 1484, 699.0, 883.4, 913.5, 1476.8000000000015, 0.028224132024106202, 46.70292787207789, 0.6614572475658782], "isController": true}, {"data": ["7.0 Open Children Search", 31, 0, 0.0, 180.54838709677415, 157, 616, 163.0, 176.6, 366.3999999999994, 616.0, 0.008658903447640169, 3.929278035120233, 0.06261038574367411], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 46.0, 46, 46, 46.0, 46.0, 46.0, 46.0, 21.73913043478261, 6.241508152173913, 13.41711956521739], "isController": false}, {"data": ["7.1 Full name search", 30, 0, 0.0, 205.76666666666665, 173, 753, 185.0, 201.70000000000002, 463.14999999999964, 753.0, 0.008657541425614259, 3.928824426538885, 0.06468834916052149], "isController": false}, {"data": ["7.5 year group", 30, 0, 0.0, 1983.8666666666668, 1703, 4196, 1868.5, 2295.4000000000005, 3577.249999999999, 4196.0, 0.008648830663679554, 4.824924175881756, 0.06466549377111215], "isController": false}, {"data": ["7.6 First name search", 30, 0, 0.0, 163.7333333333333, 151, 216, 158.5, 180.9, 213.25, 216.0, 0.008654282196526055, 3.9271847987821693, 0.06450341900039001], "isController": false}, {"data": ["1.2 Sign-in page", 101, 0, 0.0, 71.94059405940595, 15, 227, 27.0, 183.6, 188.59999999999997, 226.64000000000007, 0.028219968225992213, 12.235796113768103, 0.14500933703750685], "isController": false}, {"data": ["7.2 No Consent search", 30, 0, 0.0, 105.60000000000002, 83, 161, 100.0, 127.9, 159.9, 161.0, 0.00865771382100119, 3.9288772958092624, 0.0646727276856084], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 10.112147177419354, 19.027217741935484], "isController": false}, {"data": ["1.4 Open Sessions list", 70, 0, 0.0, 383.47142857142865, 313, 761, 356.5, 513.7, 536.5500000000001, 761.0, 0.07894716066536667, 39.2530690620598, 0.566893039426212], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["1.1 Homepage", 101, 0, 0.0, 90.60396039603964, 30, 276, 49.0, 189.8, 194.89999999999998, 275.0200000000002, 0.028226908572204713, 12.354146107107562, 0.13990256319194352], "isController": false}, {"data": ["1.3 Sign-in", 101, 0, 0.0, 268.6633663366338, 173, 679, 286.0, 318.8, 339.29999999999995, 675.0200000000008, 0.028207815072915806, 12.379232455227774, 0.23593825581583702], "isController": false}, {"data": ["Run some searches", 30, 0, 0.0, 2989.2, 2627, 5993, 2840.5, 3279.7000000000007, 5074.499999999999, 5993.0, 0.008697906066093648, 32.48172712635535, 0.5190087550041953], "isController": true}, {"data": ["7.3 Due vaccination", 30, 0, 0.0, 97.29999999999998, 84, 186, 92.5, 110.7, 155.19999999999996, 186.0, 0.00865706924731977, 3.9285847877690614, 0.06439737933560456], "isController": false}, {"data": ["7.7 Partial name search", 30, 0, 0.0, 168.03333333333333, 154, 271, 163.0, 176.8, 227.54999999999995, 271.0, 0.008658768330612557, 3.9292120840111227, 0.06452839991228668], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 648, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
