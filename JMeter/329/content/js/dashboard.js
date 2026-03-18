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

    var data = {"OkPercent": 99.99533560333971, "KoPercent": 0.0046643966602919916};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8864382476132976, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9821428571428571, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.5501792114695341, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.999400479616307, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7321428571428571, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9994044073853484, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5036855036855037, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5103926096997691, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.1111111111111111, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9912638322655795, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9804575786463299, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9906868451688009, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9886297376093295, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5086206896551724, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9827483640690066, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.9237654320987654, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9981829194427619, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.18518518518518517, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4921282798833819, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.505, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.44642857142857145, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8841354723707665, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9990886998784934, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9961309523809524, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21439, 1, 0.0046643966602919916, 181.14156443864053, 0, 4206, 94.0, 387.0, 486.0, 903.9900000000016, 5.552370045431072, 160.12409645951269, 42.24111643089683], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 28, 0, 0.0, 115.92857142857143, 79, 723, 86.0, 122.30000000000015, 498.44999999999857, 723.0, 0.00799488555749622, 0.24309671969845575, 0.05944049069395321], "isController": false}, {"data": ["2.0 Register attendance", 1674, 1, 0.05973715651135006, 748.2132616487468, 358, 2704, 737.0, 970.5, 1081.75, 1405.5, 0.46840399592818704, 64.59165615071947, 16.21508936304961], "isController": true}, {"data": ["2.5 Select patient", 1668, 0, 0.0, 95.1798561151078, 56, 1175, 85.0, 125.10000000000014, 165.0, 338.4099999999994, 0.47169691267583647, 11.900251870827583, 3.402427484022964], "isController": false}, {"data": ["7.1 Full name search", 28, 0, 0.0, 552.1785714285714, 276, 1959, 499.0, 780.4000000000003, 1523.3999999999974, 1959.0, 0.007990311176961423, 0.30128171680896076, 0.05898121543833705], "isController": false}, {"data": ["2.3 Search by first/last name", 1679, 0, 0.0, 94.3924955330553, 58, 648, 84.0, 122.0, 179.0, 305.6000000000006, 0.4698338148267127, 13.501412074564643, 3.5141478606925953], "isController": false}, {"data": ["4.0 Vaccination for flu", 407, 0, 0.0, 651.0319410319411, 171, 2481, 619.0, 799.2, 848.8, 1149.3600000000017, 0.116377652631293, 6.153815755518288, 3.305963831962965], "isController": true}, {"data": ["4.0 Vaccination for hpv", 433, 0, 0.0, 647.6812933025399, 172, 1870, 616.0, 788.2000000000002, 884.0999999999983, 1425.3199999999952, 0.12420753156606765, 6.07881786754744, 3.5174963824197865], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 1925.0000000000002, 1294, 4012, 1672.0, 3285.7999999999997, 3836.399999999999, 4012.0, 0.00802620943828722, 1.0715218936971664, 0.05918923040988068], "isController": false}, {"data": ["1.2 Sign-in page", 1717, 0, 0.0, 109.60337798485735, 12, 4206, 81.0, 131.0, 212.0, 1048.0199999999993, 0.47739518506501, 10.337025228385773, 4.051893153772131], "isController": false}, {"data": ["2.4 Patient attending session", 1049, 0, 0.0, 317.64156339370834, 224, 1515, 296.0, 399.0, 470.5, 696.0, 0.2955536503129798, 9.022410374464926, 2.594858894086983], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 24.0, 24, 24, 24.0, 24.0, 24.0, 24.0, 41.666666666666664, 13.0615234375, 24.576822916666668], "isController": false}, {"data": ["1.1 Homepage", 1718, 0, 0.0, 112.59545983701975, 26, 3266, 86.0, 133.0, 195.0, 1068.2399999999998, 0.47728440177345327, 18.470851708267688, 4.042391325599085], "isController": false}, {"data": ["1.3 Sign-in", 1715, 0, 0.0, 122.44431486880472, 55, 3265, 83.0, 182.0, 294.1999999999998, 1050.5199999999998, 0.47748205753282935, 10.546357212992914, 4.2145244077726005], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 8119.814814814814, 6418, 13279, 7135.0, 12445.199999999999, 13224.199999999999, 13279.0, 0.007998333976656122, 5.31259537365254, 0.4740881704862661], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 406, 0, 0.0, 652.6871921182276, 176, 1476, 621.0, 805.0, 907.1999999999998, 1211.1100000000001, 0.11731469551490895, 5.854744141904405, 3.330037330218763], "isController": true}, {"data": ["2.1 Open session", 1681, 1, 0.0594883997620464, 253.5823914336703, 104, 1126, 221.0, 387.0, 473.0, 617.1800000000001, 0.46938262642057355, 10.82713613946053, 3.3888387574868064], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1557.7407407407409, 650, 3712, 1346.0, 3059.7999999999997, 3562.7999999999993, 3712.0, 0.00801969161018477, 1.0712179501007362, 0.059133332997941906], "isController": false}, {"data": ["4.3 Vaccination confirm", 1620, 0, 0.0, 435.35, 318, 2229, 400.0, 547.0, 615.8499999999995, 832.79, 0.4689699653685945, 9.967929644065547, 4.834675569129068], "isController": false}, {"data": ["4.1 Vaccination questions", 1651, 0, 0.0, 117.29800121138709, 70, 1088, 102.0, 154.0, 207.79999999999973, 360.9200000000001, 0.4708605482744715, 6.657681184076671, 4.415806012869238], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1777.3703703703702, 1236, 4032, 1552.0, 2573.7999999999997, 3637.199999999998, 4032.0, 0.0080257394381269, 1.0754331191538433, 0.05919998825492483], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 32.0, 32, 32, 32.0, 32.0, 32.0, 32.0, 31.25, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1715, 0, 0.0, 754.4979591836743, 218, 10460, 655.0, 904.4000000000001, 1030.5999999999995, 3169.4399999999905, 0.4772965478240009, 78.0878742777237, 15.684316087186216], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 400, 0, 0.0, 664.0000000000002, 200, 2037, 623.0, 837.4000000000002, 951.3499999999999, 1090.95, 0.11549157835410642, 6.182601979605053, 3.287162413153942], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 1270.6785714285713, 681, 3361, 1087.5, 2668.4, 3071.199999999998, 3361.0, 0.008000806938528372, 1.0265323835696858, 0.05771229391135735], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 46.0, 46, 46, 46.0, 46.0, 46.0, 46.0, 21.73913043478261, 6.241508152173913, 13.41711956521739], "isController": false}, {"data": ["7.5 year group", 28, 0, 0.0, 1958.0714285714284, 1748, 3723, 1826.0, 2246.3, 3079.949999999996, 3723.0, 0.007995972314517001, 1.0751021498849294, 0.05964378469859325], "isController": false}, {"data": ["7.2 No Consent search", 28, 0, 0.0, 120.89285714285715, 79, 411, 90.5, 231.00000000000023, 390.7499999999999, 411.0, 0.00799468011143442, 0.24287242592714733, 0.05957949472693742], "isController": false}, {"data": ["Debug Sampler", 1679, 0, 0.0, 0.30911256700416906, 0, 19, 0.0, 1.0, 1.0, 1.0, 0.4699060048054116, 2.6477241092531463, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1683, 0, 0.0, 417.6559714795009, 314, 1306, 365.0, 563.0, 633.8, 822.1600000000001, 0.46938759003916586, 38.80569607845564, 3.385368712685011], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1646, 0, 0.0, 107.89793438639133, 70, 1059, 93.0, 147.0, 202.0, 330.17999999999984, 0.4702792647415121, 7.62434884151946, 4.170306925522879], "isController": false}, {"data": ["2.2 Session register", 1680, 0, 0.0, 105.79999999999988, 55, 1039, 83.0, 194.9000000000001, 244.94999999999982, 417.0, 0.4695449773779938, 16.97829652147875, 3.3945381739542566], "isController": false}, {"data": ["7.3 Due vaccination", 28, 0, 0.0, 100.78571428571426, 75, 383, 88.0, 110.80000000000004, 271.8499999999993, 383.0, 0.00799705936702704, 0.24273022007693174, 0.05934731776843773], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 1, 100.0, 0.0046643966602919916], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21439, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 1681, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
