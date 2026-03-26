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

    var data = {"OkPercent": 98.11199313452049, "KoPercent": 1.8880068654795108};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.617536704730832, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4369747899159664, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9913419913419913, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7692307692307693, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.99375, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4074074074074074, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.45454545454545453, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6415094339622641, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.07352941176470588, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.46875, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.8971631205673759, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.6466458658346333, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6325396825396825, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.3359580052493438, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4727272727272727, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9077868852459017, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.6462264150943396, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9793577981651376, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.26424050632911394, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4074074074074074, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.4142857142857143, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [0.32926829268292684, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.32051282051282054, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.06481481481481481, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [0.6618852459016393, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.9977064220183486, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9917695473251029, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.05555555555555555, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4661, 88, 1.8880068654795108, 1360.1323750268161, 11, 30116, 367.0, 1979.8000000000002, 3819.6999999999625, 30001.0, 4.265565056959615, 260.4636371818214, 0.6707468210741427], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 238, 0, 0.0, 1089.1008403361345, 416, 2831, 996.5, 1603.2, 2001.3499999999995, 2560.1, 0.27610176786337837, 38.39561961065011, 0.03354522283036795], "isController": true}, {"data": ["2.5 Select patient", 231, 0, 0.0, 157.87445887445892, 65, 769, 100.0, 330.20000000000005, 424.99999999999966, 697.5200000000013, 0.26999670393634156, 6.830827350330074, 0.0], "isController": false}, {"data": ["7.1 Full name search", 39, 0, 0.0, 654.2564102564102, 280, 2980, 430.0, 1225.0, 2330.0, 2980.0, 0.0495778887700997, 1.8579207053312756, 0.0], "isController": false}, {"data": ["2.3 Search by first/last name", 240, 0, 0.0, 126.60833333333343, 64, 696, 92.5, 240.9, 277.84999999999997, 554.3900000000001, 0.27780414344879956, 7.958147096642852, 0.0], "isController": false}, {"data": ["4.0 Vaccination for flu", 54, 0, 0.0, 986.092592592593, 568, 2040, 821.5, 1637.0, 1686.5, 2040.0, 0.07242634977903258, 4.0046875419133965, 0.16909959964323315], "isController": true}, {"data": ["4.0 Vaccination for hpv", 55, 0, 0.0, 953.8727272727273, 172, 1964, 777.0, 1535.6, 1803.3999999999999, 1964.0, 0.06897027381198705, 3.513004325533422, 0.16351784057207705], "isController": true}, {"data": ["1.2 Sign-in page", 636, 14, 2.20125786163522, 1624.163522012579, 11, 30116, 409.0, 2824.700000000006, 6066.699999999999, 30020.63, 0.6873736167416545, 50.1154718523341, 0.0], "isController": false}, {"data": ["7.2 First name search", 34, 0, 0.0, 2705.441176470588, 1391, 8698, 2089.0, 5564.5, 6890.5, 8698.0, 0.041098390756246654, 5.491027603688822, 0.0], "isController": false}, {"data": ["7.7 Due vaccination search", 48, 0, 0.0, 737.4999999999999, 535, 2488, 609.0, 1232.9, 1691.1, 2488.0, 0.05719330981258467, 7.522149002870389, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 141, 0, 0.0, 449.21985815602847, 266, 1311, 358.0, 792.0, 1009.3000000000001, 1290.0000000000007, 0.16768367010794785, 5.159277327606916, 0.03438825265885649], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 21.0, 21, 21, 21.0, 21.0, 21.0, 21.0, 47.61904761904761, 14.927455357142856, 28.087797619047617], "isController": false}, {"data": ["1.1 Homepage", 641, 3, 0.46801872074882994, 1128.3744149766, 32, 30035, 430.0, 2319.2000000000007, 3557.3999999999987, 8918.640000000036, 0.7124969293716578, 52.86095266556939, 0.0], "isController": false}, {"data": ["1.3 Sign-in", 630, 14, 2.2222222222222223, 1720.2142857142862, 64, 30103, 486.0, 2730.3999999999996, 6118.599999999994, 30017.0, 0.7063413759081533, 52.23373124306272, 0.2136695800912638], "isController": false}, {"data": ["Run some searches", 381, 40, 10.498687664041995, 4720.8136482939635, 0, 30002, 1495.0, 30000.0, 30000.0, 30001.0, 0.42864568215416393, 43.47456297969502, 0.0], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 55, 0, 0.0, 948.5090909090908, 223, 1833, 809.0, 1577.3999999999999, 1711.9999999999998, 1833.0, 0.06852882322304761, 3.433965703815934, 0.15919323508376715], "isController": true}, {"data": ["2.1 Open session", 244, 0, 0.0, 386.44672131147547, 121, 1166, 391.5, 571.0, 677.0, 943.4500000000003, 0.2768467607794371, 6.28531653250283, 0.0], "isController": false}, {"data": ["4.3 Vaccination confirm", 212, 0, 0.0, 658.0943396226413, 369, 1639, 560.0, 1034.2000000000003, 1213.0, 1443.0200000000002, 0.2708593652180801, 6.047225292547279, 0.17597973313964335], "isController": false}, {"data": ["4.1 Vaccination questions", 218, 0, 0.0, 195.37614678899067, 83, 810, 117.5, 424.69999999999993, 492.04999999999995, 719.6400000000001, 0.26920326946135886, 3.9323657271513723, 0.37698249916337057], "isController": false}, {"data": ["1.0 Login", 632, 17, 2.689873417721519, 4602.0601265822825, 357, 90115, 1533.5, 8357.800000000005, 18899.500000000004, 60672.26999999999, 0.7063212398172952, 178.51337714592574, 0.21298733860503788], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 54, 0, 0.0, 1048.9074074074074, 604, 2023, 914.5, 1693.5, 1859.25, 2023.0, 0.07150272239994915, 3.9880496006275026, 0.17028965057678863], "isController": true}, {"data": ["7.0 Open Children Search", 385, 17, 4.415584415584416, 2824.2675324675342, 84, 30001, 1361.0, 5069.400000000013, 11461.099999999984, 30001.0, 0.4363679227640111, 45.46982865581395, 0.0], "isController": false}, {"data": ["7.8 Year group search", 41, 0, 0.0, 1697.5609756097563, 1303, 4068, 1414.0, 2814.400000000002, 3509.2, 4068.0, 0.05012886787008553, 6.790601345440473, 0.0], "isController": false}, {"data": ["7.9 DOB search", 39, 0, 0.0, 1502.923076923077, 731, 4603, 1031.0, 3026.0, 4493.0, 4603.0, 0.05606283637701826, 7.569189030856841, 0.0], "isController": false}, {"data": ["7.4 Partial name search", 54, 0, 0.0, 3549.1481481481483, 1299, 9979, 2123.5, 7813.5, 9014.5, 9979.0, 0.06310910512457621, 8.42628900347217, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 244, 0, 0.0, 561.5368852459019, 315, 1327, 531.5, 762.0, 877.5, 1218.7500000000002, 0.27698221070400025, 22.85536023012227, 0.0], "isController": false}, {"data": ["4.2 Vaccination batch", 218, 0, 0.0, 148.6834862385321, 81, 654, 105.5, 279.2, 338.54999999999984, 409.91, 0.26951911854884975, 4.497254988730886, 0.08633034266017843], "isController": false}, {"data": ["7.5 Needs Consent search", 40, 40, 100.0, 30000.350000000006, 30000, 30002, 30000.0, 30001.0, 30001.0, 30002.0, 0.044992199477415604, 0.044772511003404784, 0.0], "isController": false}, {"data": ["2.2 Session register", 243, 0, 0.0, 154.60082304526736, 62, 711, 92.0, 285.6, 366.99999999999983, 628.1200000000001, 0.2762650780477268, 12.561479949109811, 0.0], "isController": false}, {"data": ["7.6 Needs triage search", 37, 0, 0.0, 218.59459459459458, 132, 428, 176.0, 377.00000000000006, 401.90000000000003, 428.0, 0.043446454593170925, 2.6213825689301484, 0.0], "isController": false}, {"data": ["7.3 Last name search", 45, 0, 0.0, 2616.866666666666, 1443, 7229, 1883.0, 5242.199999999999, 6097.099999999999, 7229.0, 0.05334793881347071, 7.1406320297023544, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 88, 100.0, 1.8880068654795108], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4661, 88, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 88, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.2 Sign-in page", 636, 14, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 641, 3, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 630, 14, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.0 Open Children Search", 385, 17, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 40, 40, "Non HTTP response code: java.util.concurrent.TimeoutException/Non HTTP response message: Idle timeout 30000 ms elapsed", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
