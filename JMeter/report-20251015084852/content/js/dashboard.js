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

    var data = {"OkPercent": 99.9626674133184, "KoPercent": 0.0373325866815997};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4913638274294012, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.18469055374592833, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.43565941101152367, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7829652996845425, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7835538752362949, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5490931832395247, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.40199530516431925, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.44353826850690087, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4781771501925546, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4844139650872818, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5068922305764411, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7139256458727158, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5276555625392835, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21429, 8, 0.0373325866815997, 791.6314340379868, 0, 7264, 713.0, 1474.0, 1795.9500000000007, 2730.9400000000096, 5.950982499462636, 2009.92004688544, 21.341992145301557], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1535, 0, 0.0, 1817.521824104235, 995, 7264, 1634.0, 2605.2000000000003, 3022.999999999999, 4924.47999999999, 0.44436814757538556, 173.897120177321, 2.304996644351039], "isController": false}, {"data": ["4.1 Vaccination questions", 1562, 0, 0.0, 1264.8476312419975, 568, 3509, 1178.0, 1571.0, 1785.0, 2502.5899999999992, 0.4449573259716919, 170.25565530844486, 2.2118186484122115], "isController": false}, {"data": ["Get Next Patient from STS", 1593, 0, 0.0, 0.6095417451349658, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.4447967574791053, 0.18725325280315497, 0.28396820022541397], "isController": false}, {"data": ["2.0 Register attendance", 1586, 8, 0.5044136191677175, 3168.2509457755355, 1556, 9389, 3070.0, 4262.6, 4764.9, 5890.099999999991, 0.4441332959955195, 798.8410314315843, 7.7132841487853545], "isController": true}, {"data": ["1.0 Login", 1596, 0, 0.0, 3601.841478696748, 1956, 8040, 3478.0, 4378.3, 4807.499999999998, 5763.149999999997, 0.44470735553210655, 718.6784524405197, 7.391639654096532], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 386, 0, 0.0, 3934.9974093264236, 1940, 9138, 3732.5, 4894.5, 5446.849999999999, 7746.649999999997, 0.11119564412669505, 128.44774716877814, 1.6210526941681918], "isController": true}, {"data": ["2.5 Select patient", 1585, 0, 0.0, 559.4214511041018, 293, 5422, 477.0, 778.0, 1052.199999999999, 1843.119999999999, 0.44674138099176025, 176.10289421562217, 1.5879134255896563], "isController": false}, {"data": ["2.3 Search by first/last name", 1587, 0, 0.0, 528.5173282923755, 287, 2945, 475.0, 705.2, 858.1999999999994, 1418.8399999999938, 0.4444954822229816, 175.23546864584324, 1.643587449829708], "isController": false}, {"data": ["4.0 Vaccination for flu", 395, 0, 0.0, 3956.61265822785, 2108, 9158, 3754.0, 4895.8, 5559.0, 7280.880000000001, 0.11307664077068459, 130.57551036211433, 1.646575143829193], "isController": true}, {"data": ["4.0 Vaccination for hpv", 387, 0, 0.0, 3933.594315245477, 1912, 7144, 3796.0, 5005.4, 5501.999999999999, 6810.000000000001, 0.11067327960960643, 127.22554590596089, 1.6096007121839842], "isController": true}, {"data": ["1.2 Sign-in page", 1599, 0, 0.0, 808.958724202626, 243, 4344, 665.0, 1265.0, 1437.0, 2293.0, 0.44481015869624724, 173.4424574756342, 1.9004112081623916], "isController": false}, {"data": ["2.4 Patient attending session", 852, 8, 0.9389671361502347, 1253.429577464789, 623, 6256, 1107.0, 1789.0000000000005, 2114.5999999999967, 3394.5900000000056, 0.24044641756003893, 94.99188592556631, 1.05150881008938], "isController": false}, {"data": ["Debug Sampler", 1586, 0, 0.0, 0.48612862547288826, 0, 7, 0.0, 1.0, 1.0, 1.0, 0.44601816300698355, 2.809702631591528, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1594, 0, 0.0, 1061.0564617314913, 541, 4166, 971.0, 1540.0, 1710.25, 2482.3999999999987, 0.44455191036003966, 198.67867091476597, 1.5796668171979675], "isController": false}, {"data": ["4.2 Vaccination batch", 1558, 0, 0.0, 903.3209242618756, 524, 3985, 823.0, 1193.2000000000003, 1446.05, 2115.660000000002, 0.44514234840874467, 171.50018430112866, 1.9929765169554092], "isController": false}, {"data": ["1.1 Homepage", 1604, 0, 0.0, 826.5729426433919, 497, 3633, 745.0, 1139.5, 1381.0, 2038.9000000000028, 0.4456190562710742, 173.56590257471063, 1.8956089372075797], "isController": false}, {"data": ["1.3 Sign-in", 1596, 0, 0.0, 907.3377192982459, 430, 3309, 822.0, 1298.0, 1479.0, 2274.8099999999995, 0.44492406043942107, 173.6535656261421, 2.0228131736759396], "isController": false}, {"data": ["2.2 Session register", 1587, 0, 0.0, 593.1241335853811, 290, 5395, 517.0, 865.2, 1110.7999999999993, 1918.3599999999915, 0.4445140330027161, 179.769172910672, 1.5865425030831686], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 390, 0, 0.0, 4009.93076923077, 1850, 9073, 3830.0, 5130.0, 5500.15, 7351.489999999986, 0.11279650296134203, 130.20761677502, 1.641273568594301], "isController": true}, {"data": ["2.1 Open session", 1591, 0, 0.0, 814.4142049025755, 306, 3243, 704.0, 1271.0, 1567.3999999999999, 2281.0, 0.444504295291663, 172.06656489801128, 1.5825787934327633], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 100.0, 0.0373325866815997], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21429, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 852, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
