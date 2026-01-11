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

    var data = {"OkPercent": 99.94419642857143, "KoPercent": 0.05580357142857143};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3972914532832594, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.020202020202020204, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.006756756756756757, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.6401098901098901, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.643510054844607, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.36879432624113473, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.3125, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.3518850987432675, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4571984435797665, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4690265486725664, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.3220035778175313, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.5654545454545454, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.44765342960288806, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7168, 4, 0.05580357142857143, 1011.2576729910679, 0, 5205, 944.0, 1901.0, 2110.0, 2760.9299999999985, 5.965419210514051, 2005.2643148371076, 21.118318480035235], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 495, 0, 0.0, 2093.131313131313, 1335, 5205, 1952.0, 2788.4, 3190.6, 4404.200000000011, 0.4651057904261497, 181.9900920648137, 2.4125564410574722], "isController": false}, {"data": ["4.1 Vaccination questions", 518, 0, 0.0, 1901.6119691119707, 857, 3459, 1812.0, 2229.0, 2431.6999999999994, 3027.43, 0.46265573322448716, 177.02665037695724, 2.2975611824247983], "isController": false}, {"data": ["Get Next Patient from STS", 557, 0, 0.0, 0.6750448833034118, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.4702207589379933, 0.19789292347304885, 0.3001774473956355], "isController": false}, {"data": ["2.0 Register attendance", 546, 4, 0.7326007326007326, 3362.4926739926764, 1991, 6829, 3167.0, 4689.5, 5108.599999999999, 5904.079999999999, 0.4705874241113137, 783.4237061216012, 7.421128260283111], "isController": true}, {"data": ["1.0 Login", 559, 0, 0.0, 4927.38103756709, 2552, 8577, 4826.0, 5712.0, 6058.0, 7044.4, 0.4688523517684289, 755.9145709104585, 7.737721614512784], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 126, 0, 0.0, 5145.238095238096, 2639, 8922, 5028.5, 6157.5, 6855.799999999996, 8666.850000000004, 0.11482217598958946, 131.4333595100556, 1.656979827065045], "isController": true}, {"data": ["2.5 Select patient", 546, 0, 0.0, 617.8534798534804, 438, 2050, 558.0, 847.1000000000001, 1006.9499999999999, 1552.0399999999954, 0.4707602692127957, 185.6257796158648, 1.6732700839932024], "isController": false}, {"data": ["2.3 Search by first/last name", 547, 0, 0.0, 624.936014625229, 437, 2086, 591.0, 812.8, 966.4000000000002, 1308.3199999999983, 0.47087869235179375, 185.605761737749, 1.7411325759711551], "isController": false}, {"data": ["4.0 Vaccination for flu", 131, 0, 0.0, 5038.511450381679, 2717, 8178, 4942.0, 5848.6, 6188.599999999999, 7866.960000000006, 0.11869382429689765, 135.76001316334896, 1.7099594509957596], "isController": true}, {"data": ["4.0 Vaccination for hpv", 132, 0, 0.0, 5065.681818181817, 2733, 8396, 4970.0, 5770.0, 6243.149999999999, 7868.98999999998, 0.11979634621144056, 137.14492624612024, 1.7335090006080573], "isController": true}, {"data": ["1.2 Sign-in page", 564, 0, 0.0, 1165.847517730496, 303, 4083, 942.0, 1895.5, 1998.25, 2694.9500000000025, 0.47147571900047147, 183.30572282389716, 1.9840722881891153], "isController": false}, {"data": ["Debug Sampler", 546, 0, 0.0, 0.5054945054945056, 0, 4, 0.5, 1.0, 1.0, 1.0, 0.47177840585558223, 2.9694673073117874, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 96, 4, 4.166666666666667, 1418.989583333333, 555, 2748, 1288.0, 2014.0999999999995, 2282.1999999999994, 2748.0, 0.12832937873876282, 50.59522696796778, 0.5582348862079337], "isController": false}, {"data": ["1.4 Open Sessions list", 557, 0, 0.0, 1350.1256732495508, 650, 3037, 1197.0, 2097.8, 2225.9000000000005, 2574.879999999999, 0.46981264006869217, 209.9631227785116, 1.6674399900280792], "isController": false}, {"data": ["4.2 Vaccination batch", 514, 0, 0.0, 1188.7529182879362, 717, 2314, 1173.0, 1468.0, 1617.75, 2102.050000000001, 0.4640220419497592, 178.7750356931352, 2.075312345965446], "isController": false}, {"data": ["1.1 Homepage", 565, 0, 0.0, 1087.0991150442485, 692, 2694, 1037.0, 1404.8000000000002, 1571.7999999999984, 2094.520000000001, 0.4715028674050485, 183.11675023194394, 1.9660967075851876], "isController": false}, {"data": ["1.3 Sign-in", 559, 0, 0.0, 1332.3506261180673, 594, 3114, 1203.0, 1932.0, 2134.0, 2647.6, 0.4697076385049349, 183.10462438303605, 2.156566562939563], "isController": false}, {"data": ["2.2 Session register", 550, 0, 0.0, 772.7854545454547, 423, 2891, 685.5, 1172.1000000000004, 1347.35, 1872.2500000000002, 0.4679102871352746, 193.23480385572964, 1.6666180146311291], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 125, 0, 0.0, 5183.104, 2757, 8001, 5085.0, 6085.2, 6374.0, 7914.419999999998, 0.11591192548254135, 132.7982455498514, 1.6722387098886782], "isController": true}, {"data": ["2.1 Open session", 554, 0, 0.0, 1095.4747292418783, 575, 2743, 1049.0, 1522.5, 1699.25, 2035.9000000000028, 0.4689137283381325, 181.54040503930963, 1.6661160342467842], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, 100.0, 0.05580357142857143], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7168, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 96, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
