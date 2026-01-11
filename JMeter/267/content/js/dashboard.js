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

    var data = {"OkPercent": 99.89288670334486, "KoPercent": 0.10711329665514387};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7409483949934852, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.44663648124191463, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9345200254291164, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.19096573208722742, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.3360198388096714, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.3368421052631579, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9596622889305816, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9682440846824408, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.32678132678132676, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.32418952618453867, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9411400247831475, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.533015407190022, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.6808312655086849, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9289808917197452, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9508044554455446, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9380037197768134, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9443061605476042, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.31151832460732987, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7322981366459628, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20539, 22, 0.10711329665514387, 393.0079361215242, 0, 13761, 157.0, 947.0, 1376.9500000000007, 2668.9900000000016, 5.425597280623758, 2128.7731300169075, 41.04882876579615], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1546, 0, 0.0, 1056.1520051746443, 448, 13761, 784.0, 1852.6, 2403.1499999999987, 4265.079999999999, 0.4468698874442858, 187.2968964415709, 4.573352426982588], "isController": false}, {"data": ["4.1 Vaccination questions", 1573, 0, 0.0, 269.9186268277176, 76, 6658, 134.0, 558.8000000000004, 883.7999999999993, 2024.6799999999998, 0.447973298171369, 183.68337319416995, 4.172184919543511], "isController": false}, {"data": ["2.0 Register attendance", 1605, 22, 1.3707165109034267, 2049.157632398757, 461, 10765, 1713.0, 3449.8000000000006, 4322.499999999992, 7043.700000000001, 0.44941479473504264, 930.1822691784263, 16.30195646509433], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1613, 0, 0.0, 1430.7644141351525, 325, 7722, 1199.0, 2392.6000000000004, 3053.5999999999995, 4537.719999999995, 0.4493271513940006, 777.2815021698037, 14.702173013343039], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 380, 0, 0.0, 1541.6763157894745, 200, 12798, 1238.5, 2599.4000000000024, 3244.0, 5548.159999999999, 0.10922289633827366, 134.86458130336834, 3.0771409362852546], "isController": true}, {"data": ["2.5 Select patient", 1599, 0, 0.0, 192.30456535334605, 56, 4735, 100.0, 362.0, 693.0, 1632.0, 0.4501739884458158, 189.805518742205, 3.2230436351514373], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.358506944444445, 13.715277777777779], "isController": false}, {"data": ["2.3 Search by first/last name", 1606, 0, 0.0, 174.79265255292663, 64, 2252, 106.0, 323.0, 552.6499999999999, 1339.2700000000025, 0.449532175839297, 191.33588977788042, 3.3381358030475257], "isController": false}, {"data": ["4.0 Vaccination for flu", 407, 0, 0.0, 1590.8402948402947, 194, 13961, 1261.0, 2556.5999999999995, 3504.7999999999997, 6429.680000000007, 0.11643884800496196, 143.76296951211836, 3.281199174228278], "isController": true}, {"data": ["4.0 Vaccination for hpv", 401, 0, 0.0, 1528.618453865337, 187, 5819, 1227.0, 2729.4, 3504.8999999999987, 4805.520000000002, 0.11469753031332734, 141.4943162421857, 3.237434886448015], "isController": true}, {"data": ["1.2 Sign-in page", 1614, 0, 0.0, 233.14188351920689, 13, 3529, 120.0, 464.0, 788.75, 2113.049999999997, 0.4490716820238609, 187.39372745120727, 3.778046318985994], "isController": false}, {"data": ["Debug Sampler", 1606, 0, 0.0, 0.35118306351183043, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.449585910660617, 2.5981403627473845, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1363, 22, 1.6140865737344094, 914.42626559061, 56, 8981, 651.0, 1629.800000000001, 2342.3999999999996, 4628.959999999986, 0.38245660604696724, 163.16467103838934, 3.324152597660421], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 32.0, 32, 32, 32.0, 32.0, 32.0, 32.0, 31.25, 9.765625, 18.4326171875], "isController": false}, {"data": ["1.4 Open Sessions list", 1612, 0, 0.0, 721.3008684863528, 304, 5642, 538.5, 1328.0000000000005, 1637.2999999999984, 2857.8399999999965, 0.4494340671580517, 214.85402604281526, 3.2173369234969535], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.2890625, 153.564453125], "isController": false}, {"data": ["4.2 Vaccination batch", 1570, 0, 0.0, 263.45796178343915, 68, 4069, 125.0, 580.5000000000005, 980.2999999999975, 2110.7499999999973, 0.44806805611524425, 184.91839801328908, 3.9444743567726204], "isController": false}, {"data": ["1.1 Homepage", 1616, 0, 0.0, 227.862004950495, 27, 5010, 124.0, 439.29999999999995, 743.0, 1888.949999999988, 0.4490176072696395, 187.22127399394424, 3.7693832366493676], "isController": false}, {"data": ["1.3 Sign-in", 1613, 0, 0.0, 248.81959082455052, 65, 4741, 123.0, 523.0, 795.6999999999996, 1870.86, 0.4492410527781646, 187.72493630108968, 3.9349153255988023], "isController": false}, {"data": ["2.2 Session register", 1607, 0, 0.0, 231.23895457374007, 60, 5892, 112.0, 491.60000000000014, 742.5999999999981, 2042.9200000000073, 0.44895453937180446, 196.03310159917007, 3.220867572257375], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 382, 0, 0.0, 1634.5706806282737, 194, 10554, 1303.5, 2647.2, 3489.8499999999995, 6276.950000000003, 0.11059093484370056, 137.01270479181184, 3.1185332936976775], "isController": true}, {"data": ["2.1 Open session", 1610, 0, 0.0, 674.2242236024849, 115, 5791, 464.0, 1397.8000000000002, 1893.949999999998, 3442.5199999999786, 0.4494276636405204, 188.58228284487504, 3.220320515025958], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 22, 100.0, 0.10711329665514387], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20539, 22, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 22, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1363, 22, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
