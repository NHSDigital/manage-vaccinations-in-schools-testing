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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5636704119850188, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.8333333333333334, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9285714285714286, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.9166666666666666, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.35714285714285715, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.23076923076923078, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9285714285714286, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [1.0, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6785714285714286, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.39285714285714285, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.6071428571428571, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.14285714285714285, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.875, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9090909090909091, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [1.0, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9285714285714286, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.39285714285714285, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 219, 0, 0.0, 768.0228310502283, 86, 3970, 591.0, 1560.0, 1813.0, 3550.0000000000055, 0.36520451452813574, 9.130803354044932, 0.46976339302092507], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 13, 0, 0.0, 5400.769230769231, 4441, 8192, 4946.0, 7614.4, 8192.0, 8192.0, 0.026212795473655133, 5.7167287162182605, 0.11169383996785909], "isController": true}, {"data": ["2.5 Select patient", 12, 0, 0.0, 446.24999999999994, 332, 722, 373.5, 711.5, 722.0, 722.0, 0.025022520268241418, 0.6188817820152721, 0.0173495990141127], "isController": false}, {"data": ["1.4 Select Organisations", 7, 0, 0.0, 426.1428571428571, 385, 609, 397.0, 609.0, 609.0, 609.0, 0.18033800494641386, 2.5911260417740105, 0.26064477277411374], "isController": false}, {"data": ["2.5 Select menacwy", 6, 0, 0.0, 394.3333333333333, 337, 608, 354.0, 608.0, 608.0, 608.0, 0.10926573426573427, 2.531518469323645, 0.07618724049388112], "isController": false}, {"data": ["2.3 Search by first/last name", 14, 0, 0.0, 1428.7142857142858, 1146, 1872, 1391.5, 1790.0, 1872.0, 1872.0, 0.02705747975037542, 1.2751875391367118, 0.023356327560748874], "isController": false}, {"data": ["2.5 Select td_ipv", 6, 0, 0.0, 446.5, 339, 600, 385.5, 600.0, 600.0, 600.0, 0.10426803837063812, 2.449738868300779, 0.07260069468580564], "isController": false}, {"data": ["4.0 Vaccination for flu", 8, 0, 0.0, 1942.875, 1867, 2036, 1945.0, 2036.0, 2036.0, 2036.0, 0.027981713949933717, 1.4688726112797785, 0.16316290429204514], "isController": true}, {"data": ["4.0 Vaccination for hpv", 8, 0, 0.0, 2121.25, 1913, 3173, 1982.5, 3173.0, 3173.0, 3173.0, 0.027432396288396783, 1.4132573163058164, 0.1624579191327248], "isController": true}, {"data": ["1.2 Sign-in page", 7, 0, 0.0, 89.99999999999999, 86, 96, 89.0, 96.0, 96.0, 96.0, 0.13669739103265116, 0.8237886719360257, 0.08236551783900953], "isController": false}, {"data": ["2.4 Patient attending session", 13, 0, 0.0, 1547.230769230769, 1355, 1937, 1505.0, 1844.6, 1937.0, 1937.0, 0.026489904289938117, 1.1247901502894533, 0.03937268977469318], "isController": false}, {"data": ["1.1 Homepage", 7, 0, 0.0, 318.7142857142857, 261, 630, 267.0, 630.0, 630.0, 630.0, 0.1363804625245972, 0.7038776801196251, 0.0739171452159682], "isController": false}, {"data": ["1.3 Sign-in", 7, 0, 0.0, 433.8571428571429, 425, 449, 433.0, 449.0, 449.0, 449.0, 0.1737058911112214, 1.6856596093478584, 0.27328143611345473], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 6, 0, 0.0, 4022.0, 1962, 7218, 3736.5, 7218.0, 7218.0, 7218.0, 0.09318506554016276, 5.236078539479406, 0.5524369835994284], "isController": true}, {"data": ["2.1 Open session", 14, 0, 0.0, 747.7142857142857, 383, 2439, 619.0, 1757.0, 2439.0, 2439.0, 0.02715356894873018, 0.47237853202472524, 0.017196376428956564], "isController": false}, {"data": ["4.3 Vaccination confirm", 28, 0, 0.0, 1301.0357142857144, 845, 3970, 931.0, 2622.9000000000015, 3825.099999999999, 3970.0, 0.07186913656932677, 1.5177768028565415, 0.16723009609930262], "isController": false}, {"data": ["4.1 Vaccination questions", 28, 0, 0.0, 616.3214285714283, 431, 1918, 596.0, 686.6000000000001, 1386.5499999999965, 1918.0, 0.07367703670958355, 0.8553494873525473, 0.14477157405068455], "isController": false}, {"data": ["5.2 Consent who", 1, 0, 0.0, 713.0, 713, 713, 713.0, 713.0, 713.0, 713.0, 1.402524544179523, 27.68890252454418, 2.1832266830294533], "isController": false}, {"data": ["1.0 Login", 7, 0, 0.0, 1595.142857142857, 1485, 1858, 1518.0, 1858.0, 1858.0, 1858.0, 0.13303179459890913, 6.147653859584941, 0.6333300768258614], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 6, 0, 0.0, 1959.6666666666665, 1873, 2144, 1916.0, 2144.0, 2144.0, 2144.0, 0.10579958032833137, 5.584113559318298, 0.6271173692052688], "isController": true}, {"data": ["2.5 Select hpv", 8, 0, 0.0, 417.75, 334, 597, 371.5, 597.0, 597.0, 597.0, 0.027702078002126134, 0.6082181947681163, 0.020641294448849847], "isController": false}, {"data": ["2.5 Select flu", 11, 0, 0.0, 424.27272727272725, 339, 717, 370.0, 699.4000000000001, 717.0, 717.0, 0.022929325565155763, 0.47058043763744567, 0.01589826284302792], "isController": false}, {"data": ["5.1 Consent start", 1, 0, 0.0, 910.0, 910, 910, 910.0, 910.0, 910.0, 910.0, 1.098901098901099, 13.828554258241757, 2.336237980769231], "isController": false}, {"data": ["1.5 Open Sessions list", 7, 0, 0.0, 326.42857142857144, 296, 407, 316.0, 407.0, 407.0, 407.0, 0.16595542911332387, 1.8175684936581318, 0.09918429943100995], "isController": false}, {"data": ["4.2 Vaccination batch", 28, 0, 0.0, 525.6071428571429, 418, 2791, 429.0, 572.6000000000001, 1815.3999999999937, 2791.0, 0.07378090234043562, 1.5007306244433494, 0.11854814417974081], "isController": false}, {"data": ["2.2 Session register", 14, 0, 0.0, 1286.5714285714284, 766, 3158, 1057.5, 2428.5, 3158.0, 3158.0, 0.027181457586247734, 2.3301596504124786, 0.01745293785445106], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 219, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
