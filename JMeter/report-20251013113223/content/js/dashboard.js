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

    var data = {"OkPercent": 99.97802801428179, "KoPercent": 0.021971985718209283};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5496404494382022, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3607547169811321, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4781132075471698, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.010566037735849057, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9049056603773585, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8966037735849056, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6695340501792114, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.476984126984127, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.45161290322580644, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4977358490566038, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5480286738351254, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5931899641577061, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8150943396226416, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6045283018867924, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 18205, 4, 0.021971985718209283, 686.7482010436681, 0, 13116, 609.0, 1276.0, 1451.7000000000007, 2005.819999999996, 5.602217622690258, 1883.8744664833982, 20.087186086463248], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1325, 0, 0.0, 1461.763018867923, 945, 11114, 1340.0, 1853.8000000000006, 2119.1000000000004, 3423.26, 0.42879578932243473, 166.9009119576259, 2.2242384698025823], "isController": false}, {"data": ["4.1 Vaccination questions", 1325, 0, 0.0, 1221.263396226416, 468, 7644, 1181.0, 1361.4, 1508.9000000000008, 1926.96, 0.42901737536559564, 163.92076553475962, 2.13264480378607], "isController": false}, {"data": ["Get Next Patient from STS", 1395, 0, 0.0, 0.6473118279569895, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.43116317625394307, 0.17908327271549968, 0.27528878998536205], "isController": false}, {"data": ["2.0 Register attendance", 1325, 4, 0.3018867924528302, 2514.7184905660406, 1308, 9332, 2458.0, 3299.0, 3719.1000000000004, 5477.640000000003, 0.42871310033989674, 759.2539252021019, 7.331180440288354], "isController": true}, {"data": ["1.0 Login", 1395, 0, 0.0, 3253.2250896057312, 1912, 16501, 3201.0, 3736.2000000000003, 4001.2000000000003, 6142.799999999972, 0.43084344940369107, 693.315963408516, 7.159535470847032], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 341, 0, 0.0, 3470.038123167157, 2649, 10803, 3308.0, 3994.6, 4581.899999999998, 6397.399999999996, 0.11067396876852004, 127.98258935533468, 1.620841292757963], "isController": true}, {"data": ["2.5 Select patient", 1325, 0, 0.0, 439.1124528301885, 294, 7784, 371.0, 585.0, 663.7, 1209.400000000001, 0.42867759271487504, 168.29830980109037, 1.5237346296840306], "isController": false}, {"data": ["2.3 Search by first/last name", 1325, 0, 0.0, 425.48905660377324, 294, 3783, 395.0, 582.4000000000001, 649.8000000000002, 982.4600000000007, 0.42899778993289506, 168.8171513073586, 1.5863005874396245], "isController": false}, {"data": ["4.0 Vaccination for flu", 307, 0, 0.0, 3440.745928338763, 2698, 7293, 3320.0, 3957.4, 4400.19999999999, 6115.160000000006, 0.1103410400739249, 127.37627015464908, 1.612389897073734], "isController": true}, {"data": ["4.0 Vaccination for hpv", 333, 0, 0.0, 3548.3693693693704, 2709, 12021, 3329.0, 4122.200000000001, 4750.300000000003, 9616.300000000028, 0.11127507197792945, 128.20303215329545, 1.6286614678151057], "isController": true}, {"data": ["1.2 Sign-in page", 1395, 0, 0.0, 697.0279569892457, 227, 8776, 558.0, 1212.0, 1276.6000000000001, 1588.199999999998, 0.43104913342129414, 167.243998855074, 1.8394395931568246], "isController": false}, {"data": ["2.4 Patient attending session", 630, 4, 0.6349206349206349, 967.6063492063491, 473, 6569, 878.0, 1241.3999999999999, 1418.8999999999985, 2541.569999999991, 0.2039372184128764, 80.62591923487287, 0.8922929808613013], "isController": false}, {"data": ["Debug Sampler", 1325, 0, 0.0, 0.6022641509433956, 0, 8, 1.0, 1.0, 1.0, 1.0, 0.42901279138063114, 2.6975485141627646, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1395, 0, 0.0, 1025.32258064516, 486, 5141, 900.0, 1508.8000000000002, 1618.2, 2095.3199999999997, 0.43107564033273477, 191.89937514745802, 1.5316405874595307], "isController": false}, {"data": ["4.2 Vaccination batch", 1325, 0, 0.0, 812.7954716981147, 462, 7038, 770.0, 983.8000000000002, 1141.4, 2143.6400000000017, 0.42895626361936134, 164.5922126141752, 1.9203333043787856], "isController": false}, {"data": ["1.1 Homepage", 1395, 0, 0.0, 690.2394265232969, 456, 13116, 626.0, 880.0, 929.4000000000003, 1428.08, 0.43119582812627016, 167.20946464120797, 1.8313298673392808], "isController": false}, {"data": ["1.3 Sign-in", 1395, 0, 0.0, 840.6344086021514, 402, 13107, 711.0, 1259.8000000000002, 1352.2, 1936.3199999999997, 0.431212089270485, 167.42606870419917, 1.9620020258660795], "isController": false}, {"data": ["2.2 Session register", 1325, 0, 0.0, 492.16226415094343, 285, 5104, 443.0, 681.8000000000002, 811.0, 1237.5000000000002, 0.4290373793554984, 173.95254995077806, 1.5312779810286146], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 344, 0, 0.0, 3519.6686046511613, 2701, 13110, 3374.5, 3931.0, 4470.0, 7254.050000000005, 0.11296514795314705, 130.70335715425688, 1.6541651424034058], "isController": true}, {"data": ["2.1 Open session", 1325, 0, 0.0, 696.6294339622639, 310, 3895, 630.0, 1112.4, 1229.5000000000007, 1456.48, 0.4292320989158083, 165.1511070098299, 1.5282004071711888], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, 100.0, 0.021971985718209283], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 18205, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 630, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
