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

    var data = {"OkPercent": 99.80997624703087, "KoPercent": 0.19002375296912113};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.22526593241080675, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.07838983050847458, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.411522633744856, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.46216216216216216, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.38552631578947366, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.31940509915014165, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.35386631716906947, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.3438735177865613, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.4468371467025572, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4203480589022758, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8420, 16, 0.19002375296912113, 2725.384916864613, 241, 34722, 1358.0, 6651.000000000011, 12381.95, 16020.799999999886, 4.652190728769545, 1900.2604695442426, 19.26014720685535], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 694, 0, 0.0, 3761.564841498562, 2212, 16952, 3280.0, 5525.0, 7121.75, 10799.349999999955, 0.42347232663262613, 170.83699594722796, 2.196535064683262], "isController": false}, {"data": ["4.1 Vaccination questions", 708, 0, 0.0, 2044.5677966101716, 995, 9448, 1838.5, 2740.7000000000007, 3535.199999999998, 5880.819999999997, 0.4182385070066765, 165.12004302174515, 2.0776633795857076], "isController": false}, {"data": ["2.0 Register attendance", 739, 8, 1.0825439783491204, 5411.179972936395, 2537, 22542, 4802.0, 7792.0, 10048.0, 19310.600000000006, 0.42272945943827894, 762.7967795024334, 6.849130478322102], "isController": true}, {"data": ["1.0 Login", 758, 8, 1.0554089709762533, 18088.15171503958, 3700, 50763, 16423.0, 21239.200000000004, 33138.84999999999, 42339.01999999999, 0.42143725672145166, 698.7887921518917, 6.963291917543688], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 170, 0, 0.0, 7349.641176470592, 2579, 19093, 6485.5, 10279.400000000001, 13388.749999999993, 17508.27999999998, 0.10134738365767476, 120.80254627104226, 1.4775025668460517], "isController": true}, {"data": ["2.5 Select patient", 729, 0, 0.0, 1114.9670781892987, 568, 9784, 877.0, 1751.0, 2222.5, 4691.3000000000175, 0.4197623419629331, 170.755684924997, 1.491998554763727], "isController": false}, {"data": ["2.3 Search by first/last name", 740, 0, 0.0, 909.6256756756756, 568, 11655, 716.0, 1360.6999999999998, 1955.0, 3932.13, 0.42389192359863626, 172.6509500083919, 1.5760756624528562], "isController": false}, {"data": ["4.0 Vaccination for flu", 192, 0, 0.0, 7311.578124999995, 3133, 21833, 6642.0, 10059.400000000007, 11868.999999999996, 16562.689999999962, 0.11429782441234845, 135.1633507104845, 1.6512945177375937], "isController": true}, {"data": ["4.0 Vaccination for hpv", 173, 0, 0.0, 7569.086705202311, 3199, 21773, 6549.0, 11108.399999999998, 13611.199999999999, 19434.59999999997, 0.10410110202750435, 123.96398683395603, 1.5199952624220294], "isController": true}, {"data": ["1.2 Sign-in page", 760, 0, 0.0, 1317.6552631578948, 241, 17154, 1062.0, 1936.6, 2584.8999999999996, 5652.639999999996, 0.42443992080844634, 170.3531938536841, 1.796983095179256], "isController": false}, {"data": ["2.4 Patient attending session", 315, 8, 2.5396825396825395, 2731.8285714285735, 664, 10906, 2348.0, 4048.8, 5079.799999999996, 8303.359999999995, 0.2051912740945039, 83.64036727426354, 0.8949783578167778], "isController": false}, {"data": ["1.4 Open Sessions list", 756, 8, 1.0582010582010581, 13732.108465608462, 9991, 34722, 12506.0, 16225.1, 25177.1, 30472.81999999998, 0.4221093743456886, 192.01333484464726, 1.4860306259614016], "isController": false}, {"data": ["4.2 Vaccination batch", 706, 0, 0.0, 1636.5396600566567, 1003, 12058, 1388.0, 2221.4000000000015, 3027.5999999999985, 6216.85999999998, 0.42061690081603254, 167.17401512958546, 1.8819916016626879], "isController": false}, {"data": ["1.1 Homepage", 763, 0, 0.0, 1582.3604193971153, 975, 16738, 1331.0, 2235.4000000000005, 2967.3999999999996, 5918.8, 0.4240629903054643, 170.0189515306562, 1.7825438992730904], "isController": false}, {"data": ["1.3 Sign-in", 759, 0, 0.0, 1490.833992094861, 683, 18476, 1227.0, 2208.0, 2855.0, 5307.799999999977, 0.4244318401049504, 170.67833709621658, 1.9417892115745192], "isController": false}, {"data": ["2.2 Session register", 743, 0, 0.0, 1055.3660834454918, 567, 17597, 803.0, 1553.0, 2240.5999999999995, 5829.55999999993, 0.4235918421798276, 179.32898923799505, 1.510823634750095], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 171, 0, 0.0, 7288.923976608188, 4704, 25457, 6618.0, 9248.400000000001, 11018.000000000002, 20237.72000000001, 0.10373909677826405, 123.51975333072266, 1.5090944845152714], "isController": true}, {"data": ["2.1 Open session", 747, 0, 0.0, 1180.5769745649277, 586, 6143, 1030.0, 1724.2, 2122.4, 3622.6799999999985, 0.42488760670537484, 169.629856421441, 1.5117302058259086], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 8, 50.0, 0.09501187648456057], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 50.0, 0.09501187648456057], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8420, 16, "502/Bad Gateway", 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 315, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.4 Open Sessions list", 756, 8, "502/Bad Gateway", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
