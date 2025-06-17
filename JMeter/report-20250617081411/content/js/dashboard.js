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

    var data = {"OkPercent": 99.81922090039654, "KoPercent": 0.1807790996034523};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5897771640796114, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.9785714285714285, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.4423292273236282, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.1298476454293629, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.3169897377423033, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8214285714285714, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.3509454949944383, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9072272411396803, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.4520596590909091, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.681129476584022, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.6666666666666666, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.9345730027548209, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.48166089965397924, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.6666666666666666, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.06428571428571428, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [0.7731707317073171, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.004479669193659545, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.8146453089244852, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.75, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9448909299655568, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8617171006333568, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.75, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.4437639198218263, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent homepage"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 17148, 31, 0.1807790996034523, 675.6294028458117, 0, 6798, 527.0, 1337.0, 1564.5499999999993, 2220.5099999999984, 4.762187762610439, 162.47530287028522, 5.050234519539883], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 886, 0, 0.0, 5793.081264108352, 3388, 10276, 5665.0, 7031.900000000001, 7431.75, 8530.69, 0.25286124196537685, 82.83814654867949, 1.098036030158412], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 290.0, 290, 290, 290.0, 290.0, 290.0, 290.0, 3.4482758620689653, 52.25956357758621, 2.0945581896551726], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 388.7285714285714, 350, 721, 368.5, 446.09999999999997, 518.4000000000003, 721.0, 0.07943659030918991, 1.1412028125375906, 0.11481069693125104], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 260.0, 260, 260, 260.0, 260.0, 260.0, 260.0, 3.8461538461538463, 44.44486177884615, 2.336237980769231], "isController": false}, {"data": ["2.3 Search by first/last name", 893, 0, 0.0, 1220.9529675251974, 847, 4018, 1157.0, 1537.6, 1743.3, 2762.8399999999965, 0.254393993908788, 26.97677864052975, 0.21944275091779827], "isController": false}, {"data": ["5.8 Consent confirm", 2, 0, 0.0, 970.0, 916, 1024, 970.0, 1024.0, 1024.0, 1024.0, 0.001912726132046961, 0.1599199685500006, 0.004156069964652821], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 109.72857142857139, 103, 139, 108.0, 113.9, 129.35000000000002, 139.0, 0.07895553111693877, 0.47581502199475506, 0.04757379169838987], "isController": false}, {"data": ["3.0 Nurse triage", 1444, 0, 0.0, 1736.0914127423825, 1022, 4793, 1665.5, 2150.0, 2491.75, 3310.8499999999995, 0.4175657535934078, 49.335443658100836, 1.255690652744338], "isController": true}, {"data": ["2.4 Patient attending session", 877, 0, 0.0, 1520.7400228050194, 1034, 5604, 1395.0, 2048.8, 2341.299999999999, 3243.1600000000008, 0.2507052335360701, 22.578470374063215, 0.3726302396893542], "isController": false}, {"data": ["5.4 Consent route", 2, 0, 0.0, 410.0, 401, 419, 410.0, 419.0, 419.0, 419.0, 0.0019173157579388859, 0.0218057219892151, 0.0029826992210904733], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 329.3142857142858, 302, 602, 319.0, 365.3, 386.30000000000007, 602.0, 0.0789036451229657, 0.4072321918699938, 0.04276515922191988], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 501.55714285714294, 435, 781, 491.5, 564.7, 646.7500000000003, 781.0, 0.0794133396258951, 0.7706351131469917, 0.12493641614972363], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 6798.0, 6798, 6798, 6798.0, 6798.0, 6798.0, 6798.0, 0.14710208884966164, 1462.110007079288, 0.09208245991468078], "isController": false}, {"data": ["2.1 Open session", 899, 0, 0.0, 1353.2347052280306, 630, 4490, 1289.0, 1888.0, 2120.0, 2738.0, 0.2547435718335785, 4.213727640779118, 0.16689514969585204], "isController": false}, {"data": ["3.3 Nurse triage complete", 1439, 0, 0.0, 434.89367616400295, 285, 3039, 364.0, 622.0, 799.0, 1505.199999999999, 0.41794460709140757, 9.745580599738894, 0.2831243882586319], "isController": false}, {"data": ["4.3 Vaccination confirm", 1408, 0, 0.0, 1137.9644886363656, 752, 5649, 1034.5, 1487.1000000000001, 1778.55, 2800.0400000000036, 0.4191539045019749, 10.539908133885437, 0.9757101168212892], "isController": false}, {"data": ["5.6 Consent questions", 2, 0, 0.0, 644.5, 630, 659, 644.5, 659.0, 659.0, 659.0, 0.0019183529788664644, 0.023033349487464043, 0.0037205556797156236], "isController": false}, {"data": ["4.1 Vaccination questions", 1452, 30, 2.0661157024793386, 579.1728650137742, 107, 2176, 597.0, 733.0, 870.3499999999999, 1410.47, 0.4270648526802731, 4.889644512812239, 0.9054993414245259], "isController": false}, {"data": ["5.3 Consent parent details", 3, 1, 33.333333333333336, 399.6666666666667, 338, 431, 430.0, 431.0, 431.0, 431.0, 0.0025939776485592613, 0.03331048966732236, 0.0037381312012278157], "isController": false}, {"data": ["3.1 Nurse triage new", 1452, 0, 0.0, 382.9125344352625, 247, 2069, 311.5, 514.7, 577.3499999999999, 989.6200000000013, 0.4175649921792838, 4.6870019600139825, 0.28776230278178233], "isController": false}, {"data": ["3.2 Nurse triage result", 1445, 0, 0.0, 919.4304498269892, 527, 3358, 850.0, 1172.4, 1344.7, 2085.4199999999955, 0.41823565335934404, 35.00146849421055, 0.6871421728970273], "isController": false}, {"data": ["5.2 Consent who", 3, 0, 0.0, 497.6666666666667, 465, 523, 505.0, 523.0, 523.0, 523.0, 0.0026017004714281255, 0.038832412114558075, 0.004064310078900903], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1705.6428571428573, 1442, 9342, 1578.0, 1726.8999999999999, 1902.1000000000001, 9342.0, 0.07877693186358087, 14.846098581241524, 0.37710829401520396], "isController": true}, {"data": ["5.0 Consent", 3, 1, 33.333333333333336, 4090.6666666666665, 1750, 5333, 5189.0, 5333.0, 5333.0, 5333.0, 0.002585716502042716, 0.3888355360405785, 0.029832535801399735], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 615, 0, 0.0, 505.917073170732, 284, 1840, 437.0, 718.4, 832.0, 1242.400000000001, 0.18401625806080973, 5.22516964045542, 0.1283391844519128], "isController": false}, {"data": ["4.0 Vaccination", 1451, 30, 2.067539627842867, 2174.5775327360443, 108, 6777, 2090.0, 2735.0, 3098.5999999999976, 4194.0, 0.4235515689360098, 22.343030549788033, 2.5253274273832362], "isController": true}, {"data": ["2.5 Patient return to consent page", 874, 0, 0.0, 481.16933638443965, 282, 2220, 387.0, 692.0, 787.5, 1413.75, 0.2506732182053002, 5.479054878164642, 0.1738066259040656], "isController": false}, {"data": ["5.5 Consent agree", 2, 0, 0.0, 540.0, 454, 626, 540.0, 626.0, 626.0, 626.0, 0.001918807576219834, 0.03331117410396483, 0.0029494171142285335], "isController": false}, {"data": ["Debug Sampler", 2300, 0, 0.0, 0.26739130434782626, 0, 7, 0.0, 1.0, 1.0, 1.0, 0.6556012576142386, 2.5798566424521767, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 871, 0, 0.0, 369.0195177956369, 246, 1459, 300.0, 506.80000000000007, 565.0, 922.9999999999986, 0.24589870046348092, 2.662141595056787, 0.15866722383825568], "isController": false}, {"data": ["4.2 Vaccination batch", 1421, 0, 0.0, 501.4025334271639, 378, 3789, 438.0, 631.5999999999999, 753.8999999999999, 1448.9399999999994, 0.41876528191213946, 7.227318928864863, 0.676972177084374], "isController": false}, {"data": ["5.7 Consent triage", 2, 0, 0.0, 514.5, 429, 600, 514.5, 600.0, 600.0, 600.0, 0.001919173987515773, 0.03128497244785844, 0.003171135143434266], "isController": false}, {"data": ["2.2 Session register", 898, 0, 0.0, 1239.8318485523387, 562, 3604, 1177.5, 1534.7000000000003, 1861.1, 2499.04, 0.2546840018173887, 23.052761399058916, 0.1690934130506549], "isController": false}, {"data": ["5.1 Consent homepage", 3, 0, 0.0, 879.0, 835, 914, 888.0, 914.0, 914.0, 914.0, 0.002595095097259839, 0.032616087794662234, 0.005527248444456747], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 62.0, 62, 62, 62.0, 62.0, 62.0, 62.0, 16.129032258064516, 0.1102570564516129, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 31, 100.0, 0.1807790996034523], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 17148, 31, "422/Unprocessable Entity", 31, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1452, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["5.3 Consent parent details", 3, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
