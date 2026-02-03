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

    var data = {"OkPercent": 99.9713672154617, "KoPercent": 0.02863278453829635};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8519459521884745, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5741995073891626, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9924516908212561, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.47501487209994053, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.5139300533491404, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4752475247524752, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9934445768772348, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9961355529131986, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4796380090497738, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.474009900990099, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9926210153482881, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.6773428232502966, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9570243034973326, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.992744860943168, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9911452184179457, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.98814463544754, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9881305637982196, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.4566831683168317, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9264094955489615, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20955, 6, 0.02863278453829635, 220.6393700787403, 0, 3696, 123.0, 538.0, 712.0, 1114.9900000000016, 5.633300751321829, 2202.8898590908652, 42.45980256077271], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1624, 0, 0.0, 730.1397783251233, 434, 3696, 663.0, 1035.0, 1296.5, 2048.25, 0.4672553009308278, 195.71563503509162, 4.780964827979414], "isController": false}, {"data": ["4.1 Vaccination questions", 1656, 0, 0.0, 153.29347826086962, 77, 2025, 123.0, 224.0, 300.0, 573.6000000000013, 0.47052405468989733, 192.82457170741486, 4.381289658735097], "isController": false}, {"data": ["2.0 Register attendance", 1681, 6, 0.35693039857227843, 1002.5383700178471, 391, 4121, 974.0, 1527.8, 1746.4999999999993, 2324.6200000000035, 0.47036899202247473, 902.2095631384154, 15.650371076206913], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1687, 0, 0.0, 745.649673977474, 427, 2551, 679.0, 1022.2, 1216.7999999999997, 1677.9199999999983, 0.47028506467186254, 813.8271523103346, 15.39671864093122], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 404, 0, 0.0, 1007.9183168316825, 204, 2794, 944.0, 1368.5, 1674.5, 2493.6999999999975, 0.1155450738759166, 142.50955111462744, 3.2529875301411053], "isController": true}, {"data": ["2.5 Select patient", 1678, 0, 0.0, 119.04767580452919, 56, 1994, 102.0, 174.10000000000014, 262.0, 537.2500000000009, 0.47068525658377314, 198.39253749852736, 3.369126449152388], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["2.3 Search by first/last name", 1682, 0, 0.0, 111.2705112960762, 62, 931, 99.0, 159.70000000000005, 221.69999999999982, 429.2300000000014, 0.4704542428707442, 200.11746267604974, 3.4927577238615397], "isController": false}, {"data": ["4.0 Vaccination for flu", 442, 0, 0.0, 992.0158371040725, 207, 2975, 925.5, 1361.2999999999997, 1580.7999999999997, 2346.9199999999996, 0.12581093974509905, 154.94703142843377, 3.5373335913714756], "isController": true}, {"data": ["4.0 Vaccination for hpv", 404, 0, 0.0, 1017.50495049505, 214, 3313, 931.5, 1373.5, 1672.75, 2832.7499999999973, 0.1158395702237252, 142.70232066855345, 3.2661704038428345], "isController": true}, {"data": ["1.2 Sign-in page", 1694, 0, 0.0, 135.87426210153455, 18, 1185, 113.0, 221.5, 328.25, 582.7999999999993, 0.47102370077816225, 196.61549669409277, 3.966812308090513], "isController": false}, {"data": ["Debug Sampler", 1682, 0, 0.0, 0.31153388822830014, 0, 22, 0.0, 1.0, 1.0, 1.0, 0.4704693757162281, 2.6925978325263284, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 843, 6, 0.7117437722419929, 594.9074733096082, 135, 2093, 543.0, 832.6000000000001, 1009.8, 1410.4799999999996, 0.2639929576825239, 112.53978451476968, 2.2974407704946063], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.4 Open Sessions list", 1687, 0, 0.0, 315.83461766449346, 182, 1987, 290.0, 473.0, 571.5999999999999, 1001.7599999999975, 0.47044099590713545, 224.9874874625174, 3.366961290245781], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1654, 0, 0.0, 142.99093107617944, 71, 1379, 112.0, 214.0, 308.0, 576.9000000000001, 0.47078835131854896, 194.18042632007533, 4.143653307288168], "isController": false}, {"data": ["1.1 Homepage", 1694, 0, 0.0, 140.20838252656424, 35, 1095, 118.0, 210.5, 283.0, 583.2999999999988, 0.47096725943484485, 196.38954476098618, 3.9578301916807552], "isController": false}, {"data": ["1.3 Sign-in", 1687, 0, 0.0, 153.6188500296383, 67, 2006, 118.0, 281.20000000000005, 370.39999999999964, 720.9199999999983, 0.47038773947043877, 196.55082318246514, 4.119923242905218], "isController": false}, {"data": ["2.2 Session register", 1685, 0, 0.0, 131.77863501483674, 59, 2857, 98.0, 222.4000000000001, 338.6999999999998, 741.8399999999992, 0.4709929817852898, 203.71317317711393, 3.3788366208678404], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 404, 0, 0.0, 1037.4009900990097, 217, 3914, 957.5, 1514.0, 1632.75, 2358.7999999999993, 0.11648935679421289, 144.15029007769104, 3.2822712754726755], "isController": true}, {"data": ["2.1 Open session", 1685, 0, 0.0, 342.22670623145416, 101, 1946, 292.0, 564.0, 707.8999999999969, 1112.0, 0.47076875280086455, 197.68890789061862, 3.373090418053828], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, 100.0, 0.02863278453829635], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20955, 6, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 843, 6, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
