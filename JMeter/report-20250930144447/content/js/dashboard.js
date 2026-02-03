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

    var data = {"OkPercent": 99.94284081166047, "KoPercent": 0.05715918833952558};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6164577436312172, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.45050878815911194, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5018501387604071, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.07400555041628122, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9500462534690102, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Get Session ID's"], "isController": true}, {"data": [0.96577243293247, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.8609904430929627, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4836795252225519, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.25325803649000866, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.900555041628122, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.865768896611642, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7211120764552563, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9417206290471786, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8432007400555042, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 13996, 8, 0.05715918833952558, 619.2059159759913, 0, 10912, 448.0, 1139.0, 1574.0, 2573.090000000002, 5.213845523994083, 144.8599765767403, 19.211243176292125], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1081, 0, 0.0, 1096.0980573543013, 715, 10912, 940.0, 1496.4000000000012, 1856.299999999999, 3941.580000000021, 0.42757946906575267, 12.16912481805129, 2.2178757469538426], "isController": false}, {"data": ["4.1 Vaccination questions", 1081, 0, 0.0, 778.7955596669751, 356, 4146, 721.0, 922.0, 1095.199999999999, 1780.760000000002, 0.4285857581864439, 9.201961690489322, 2.130044239535827], "isController": false}, {"data": ["2.0 Register attendance", 1081, 7, 0.6475485661424607, 2129.5309898242385, 1190, 6205, 2098.0, 2752.8, 3027.9999999999986, 4644.2800000000025, 0.4277454451639045, 51.627717980275825, 6.953248855380293], "isController": true}, {"data": ["1.0 Login", 1151, 1, 0.08688097306689835, 3326.947002606429, 2049, 9167, 3122.0, 4270.599999999999, 4661.799999999997, 7614.8, 0.4307813685373906, 69.92870961331103, 6.804099947523081], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 270, 0, 0.0, 2381.381481481481, 1797, 8484, 2187.5, 2997.2000000000003, 3374.299999999999, 6815.5700000000215, 0.1075739212128601, 7.29900455588007, 1.5752412531943478], "isController": true}, {"data": ["2.5 Select patient", 1081, 0, 0.0, 386.3755781683624, 270, 4751, 352.0, 494.0, 602.299999999999, 998.7800000000013, 0.42974520601531974, 10.663954386631147, 1.5275054790277582], "isController": false}, {"data": ["Get Session ID's", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.3 Search by first/last name", 1081, 0, 0.0, 365.8667900092508, 264, 2626, 351.0, 441.0, 534.4999999999993, 913.1000000000029, 0.42789003898905537, 10.9299251514042, 1.4797642225938608], "isController": false}, {"data": ["Data prep", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["4.0 Vaccination for flu", 270, 0, 0.0, 2364.437037037036, 1852, 12037, 2153.0, 2979.1000000000004, 3365.2999999999997, 5878.620000000022, 0.10760088679071587, 7.144322544443151, 1.5722517973831462], "isController": true}, {"data": ["4.0 Vaccination for hpv", 270, 0, 0.0, 2279.72222222222, 1799, 6855, 2104.5, 2752.2000000000003, 3153.3499999999995, 5398.6000000000295, 0.10797054563515074, 6.940697202803076, 1.5801954851716453], "isController": true}, {"data": ["1.2 Sign-in page", 1151, 0, 0.0, 491.23544743701115, 165, 4743, 420.0, 784.3999999999999, 834.0, 1127.7600000000002, 0.43117366896201403, 8.692857050710293, 1.7137461752535532], "isController": false}, {"data": ["Debug Sampler", 1151, 0, 0.0, 0.4222415291051263, 0, 11, 0.0, 1.0, 1.0, 1.0, 0.43131246020852143, 2.354703634987872, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 674, 7, 1.0385756676557865, 776.0459940652817, 224, 3650, 701.5, 1026.0, 1261.25, 1940.0, 0.2677053953758461, 6.9181486440413895, 1.1105292343774638], "isController": false}, {"data": ["1.4 Open Sessions list", 1151, 1, 0.08688097306689835, 1698.3753258036504, 876, 7319, 1498.0, 2480.2, 2766.7999999999984, 3907.8000000000043, 0.4311236032494209, 34.03568615032748, 1.4281748480813687], "isController": false}, {"data": ["4.2 Vaccination batch", 1081, 0, 0.0, 470.195189639223, 358, 8321, 406.0, 594.8000000000001, 707.8999999999999, 1020.5200000000009, 0.4284505428955885, 6.8350534615662815, 1.9178048777617918], "isController": false}, {"data": ["1.1 Homepage", 1151, 0, 0.0, 513.150304083408, 351, 4595, 441.0, 737.8, 878.1999999999996, 1538.8800000000015, 0.43115461032014074, 17.925472850136128, 1.7037978947780472], "isController": false}, {"data": ["1.3 Sign-in", 1151, 0, 0.0, 624.1859252823631, 352, 6604, 533.0, 850.0, 969.3999999999992, 1966.0400000000031, 0.431048687904272, 9.330925309696873, 1.9637667778024532], "isController": false}, {"data": ["2.2 Session register", 1081, 0, 0.0, 392.65124884366327, 256, 4084, 358.0, 527.8000000000001, 717.5999999999981, 1173.8000000000006, 0.42774273707868726, 13.261887769095093, 1.4254894273648515], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 271, 0, 0.0, 2354.778597785978, 1833, 9814, 2158.0, 2907.6, 3407.7999999999997, 6439.119999999984, 0.10943295959218254, 7.1140576536291364, 1.6022978473406175], "isController": true}, {"data": ["2.1 Open session", 1081, 0, 0.0, 500.34967622571645, 284, 3487, 433.0, 743.0, 808.6999999999996, 1126.1600000000008, 0.4277938579724392, 7.575965563583781, 1.421899885181276], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 87.5, 0.05001428979708488], "isController": false}, {"data": ["Assertion failed", 1, 12.5, 0.007144898542440698], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 13996, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 674, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.4 Open Sessions list", 1151, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
