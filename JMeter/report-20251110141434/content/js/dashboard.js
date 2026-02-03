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

    var data = {"OkPercent": 99.9231015700096, "KoPercent": 0.07689842999038769};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.40148964391388636, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.007257448433919022, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.40718105423987777, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8705118411000764, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8346065699006876, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5815808556925308, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.14092872570194384, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.3306744017403916, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4862490450725745, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.580130529369108, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5170413343002176, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7696715049656226, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.42016806722689076, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 15605, 12, 0.07689842999038769, 1095.1480294777307, 227, 12173, 857.0, 2047.0, 2516.399999999998, 3977.9400000000005, 4.805586983741995, 1962.7892370003751, 22.991044250798826], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1309, 0, 0.0, 2541.3812070282665, 1373, 12173, 2242.0, 3669.0, 4381.0, 7247.900000000012, 0.4226968511183545, 170.7313310690339, 2.5219829003139385], "isController": false}, {"data": ["4.1 Vaccination questions", 1309, 0, 0.0, 1402.3712757830397, 472, 5864, 1260.0, 1765.0, 2166.0, 3206.1000000000117, 0.4229838228883688, 166.97029541372763, 2.3920023986317167], "isController": false}, {"data": ["2.0 Register attendance", 1309, 12, 0.9167303284950343, 4052.61191749427, 1675, 11629, 3909.0, 5674.0, 6559.5, 8764.60000000001, 0.4224774802397374, 809.8573772260553, 8.533416561201948], "isController": true}, {"data": ["1.0 Login", 1379, 0, 0.0, 3995.7338651196515, 2052, 12127, 3811.0, 4933.0, 5387.0, 7369.8000000000075, 0.42643712248022514, 710.8830535401819, 8.124005333575722], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 327, 0, 0.0, 4817.620795107031, 3285, 11805, 4427.0, 6286.4, 7213.599999999994, 10661.92, 0.10656811560196319, 127.50738880924796, 1.78789967371662], "isController": true}, {"data": ["2.5 Select patient", 1309, 0, 0.0, 474.6684491978608, 280, 4880, 385.0, 736.0, 1007.0, 1627.7000000000003, 0.4239192811054416, 172.40700855218287, 1.7427681625447076], "isController": false}, {"data": ["2.3 Search by first/last name", 1309, 0, 0.0, 494.2161955691365, 279, 3343, 416.0, 736.0, 952.5, 1569.9, 0.42250788934231115, 172.002527207519, 1.8061240172414852], "isController": false}, {"data": ["4.0 Vaccination for flu", 327, 0, 0.0, 4841.186544342514, 3220, 12845, 4434.0, 6397.4, 7885.399999999998, 11387.199999999977, 0.10601057252841375, 126.68136115052512, 1.7751366653977276], "isController": true}, {"data": ["4.0 Vaccination for hpv", 327, 0, 0.0, 4800.275229357799, 3296, 15075, 4483.0, 6069.999999999999, 6837.799999999998, 10813.799999999997, 0.10647342120592383, 127.01866894782037, 1.785367865161506], "isController": true}, {"data": ["1.2 Sign-in page", 1379, 0, 0.0, 876.2936910804925, 227, 7532, 648.0, 1445.0, 1784.0, 2697.8, 0.4265840761949071, 171.64906356443012, 2.090645208318575], "isController": false}, {"data": ["2.4 Patient attending session", 926, 12, 1.2958963282937366, 2002.5410367170618, 508, 8671, 1748.5, 2939.9000000000015, 3671.25, 5910.310000000001, 0.29980900935786153, 122.28330936321586, 1.5101739335411493], "isController": false}, {"data": ["1.4 Open Sessions list", 1379, 0, 0.0, 1387.7440174039164, 723, 4600, 1236.0, 2002.0, 2279.0, 2957.4000000000024, 0.4263677701831341, 196.07671106251993, 1.7522339838263152], "isController": false}, {"data": ["4.2 Vaccination batch", 1309, 0, 0.0, 849.8304048892286, 429, 7293, 772.0, 1166.0, 1479.0, 2283.0000000000027, 0.42328008109904075, 168.20173473542167, 2.177646129545855], "isController": false}, {"data": ["1.1 Homepage", 1379, 0, 0.0, 742.6823785351694, 386, 5980, 635.0, 1049.0, 1369.0, 2326.8000000000056, 0.426784883087558, 171.54612113394484, 2.0829213466834884], "isController": false}, {"data": ["1.3 Sign-in", 1379, 0, 0.0, 989.0130529369114, 391, 7048, 858.0, 1535.0, 1821.0, 2510.4, 0.4264770828101593, 171.79427476599815, 2.200543416155657], "isController": false}, {"data": ["2.2 Session register", 1309, 0, 0.0, 544.6409472880063, 272, 3332, 464.0, 833.0, 1079.5, 1627.2000000000035, 0.4224872979468215, 174.2151816576365, 1.7444788415238526], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 328, 0, 0.0, 4715.487804878052, 3208, 10174, 4458.5, 6030.1, 6602.300000000001, 9087.239999999965, 0.1076173389906806, 129.1057547033986, 1.8052267760634104], "isController": true}, {"data": ["2.1 Open session", 1309, 0, 0.0, 1122.4682964094716, 447, 6488, 970.0, 1749.0, 2178.0, 3135.200000000007, 0.42246479971005163, 169.93213172028456, 1.7406728752424976], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 12, 100.0, 0.07689842999038769], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 15605, 12, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 12, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 926, 12, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
