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

    var data = {"OkPercent": 99.95896353617071, "KoPercent": 0.041036463829288314};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4931535559592008, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2405857740585774, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4924137931034483, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0388283378746594, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9384825700615175, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9459918478260869, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0013020833333333333, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.796469020652898, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4046208530805687, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.5376641326883207, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.6796407185628742, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6847898599066043, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8896809232858113, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0013698630136986301, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6995257452574526, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 17058, 7, 0.041036463829288314, 1455.109274240812, 166, 12695, 598.0, 2120.2000000000007, 8963.0, 9993.82, 4.731842822262131, 1931.9689078867307, 19.939774384642675], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1434, 0, 0.0, 1636.8423988842399, 1101, 4611, 1510.5, 2160.5, 2514.75, 3181.900000000006, 0.41409517605109136, 167.04933449324741, 2.1762427123652746], "isController": false}, {"data": ["4.1 Vaccination questions", 1450, 0, 0.0, 1027.8213793103446, 412, 4981, 994.0, 1146.9, 1320.8000000000002, 1717.92, 0.4127965801084431, 162.97417493884916, 2.0762803352997157], "isController": false}, {"data": ["2.0 Register attendance", 1468, 7, 0.4768392370572207, 2467.5401907356936, 1109, 6164, 2559.5, 3430.0, 3660.75, 4550.129999999999, 0.41178790566578644, 766.8615547865155, 7.0566168222372205], "isController": true}, {"data": ["1.0 Login", 1498, 0, 0.0, 10940.192256341792, 2034, 15606, 10845.5, 12084.2, 12632.2, 13873.14, 0.41703368229048926, 694.3944730265788, 7.024202290845637], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 360, 0, 0.0, 3326.6833333333375, 1687, 6443, 3187.5, 4015.1000000000004, 4343.349999999999, 4965.669999999998, 0.10432523740511837, 124.6075643073623, 1.5441470897460754], "isController": true}, {"data": ["2.5 Select patient", 1463, 0, 0.0, 376.4292549555701, 263, 1402, 312.0, 556.8000000000004, 728.5999999999999, 1035.239999999999, 0.41204756093473677, 167.61575175637736, 1.484723283429717], "isController": false}, {"data": ["2.3 Search by first/last name", 1472, 0, 0.0, 370.55027173913044, 262, 1890, 347.5, 505.70000000000005, 559.3499999999999, 814.3399999999992, 0.41318277611668824, 168.26728593704212, 1.556431125789033], "isController": false}, {"data": ["4.0 Vaccination for flu", 338, 0, 0.0, 3330.573964497041, 2612, 6917, 3188.5, 3958.0000000000005, 4366.1, 5308.960000000001, 0.10600379794672525, 126.68989952915732, 1.5687123851168159], "isController": true}, {"data": ["4.0 Vaccination for hpv", 384, 0, 0.0, 3263.0520833333353, 1391, 7670, 3160.0, 3848.0, 4187.75, 4764.949999999995, 0.10999823830946456, 130.54989501694016, 1.6214859734342795], "isController": true}, {"data": ["1.2 Sign-in page", 1501, 0, 0.0, 557.117921385743, 166, 4746, 451.0, 1005.8, 1040.8999999999999, 1436.94, 0.4173722510017212, 167.76163721025858, 1.8064987423741279], "isController": false}, {"data": ["2.4 Patient attending session", 844, 7, 0.8293838862559242, 1288.075829383887, 466, 4221, 1151.0, 1813.5, 2098.5, 2781.6999999999985, 0.23951898684603723, 97.80842421746253, 1.0616560698197848], "isController": false}, {"data": ["1.4 Open Sessions list", 1496, 0, 0.0, 9129.249331550813, 6964, 12695, 9068.5, 10067.6, 10626.9, 11697.529999999999, 0.4166000644950367, 191.58722919995034, 1.5006227462590929], "isController": false}, {"data": ["4.2 Vaccination batch", 1447, 0, 0.0, 663.6599861783009, 409, 4558, 653.0, 812.4000000000001, 946.1999999999994, 1310.1999999999998, 0.4127217559413964, 164.03091179794518, 1.8719334102361556], "isController": false}, {"data": ["1.1 Homepage", 1503, 0, 0.0, 584.3825681969392, 401, 4002, 537.0, 738.0, 845.3999999999999, 1283.6000000000004, 0.4175192522766328, 167.6425647118381, 1.799071401191694], "isController": false}, {"data": ["1.3 Sign-in", 1499, 0, 0.0, 681.7344896597731, 347, 2229, 585.0, 1038.0, 1130.0, 1462.0, 0.41731463184720324, 167.90435231591175, 1.9234000432104383], "isController": false}, {"data": ["2.2 Session register", 1473, 0, 0.0, 415.99660556687, 257, 1928, 378.0, 551.6000000000001, 634.0, 1034.4599999999998, 0.4129405996301196, 171.67596253899177, 1.494649159845998], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 365, 0, 0.0, 3335.1178082191796, 1493, 6674, 3206.0, 3992.6000000000004, 4389.4, 4978.42, 0.10565414679500316, 125.96443330444488, 1.5591565279391535], "isController": true}, {"data": ["2.1 Open session", 1476, 0, 0.0, 564.676151761518, 289, 2060, 541.5, 784.8999999999999, 903.1499999999999, 1177.69, 0.413049567907056, 164.83978386887523, 1.491417030766876], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 100.0, 0.041036463829288314], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 17058, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 844, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
