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

    var data = {"OkPercent": 98.52185089974293, "KoPercent": 1.4781491002570695};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.43733681462140994, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.5324675324675324, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4857142857142857, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.8220338983050848, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.05813953488372093, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8728813559322034, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.037037037037037035, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.45714285714285713, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.04310344827586207, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.46825396825396826, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.7061855670103093, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.5, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.6623376623376623, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.4485294117647059, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8324742268041238, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.06741573033707865, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1556, 23, 1.4781491002570695, 3006.6278920308437, 104, 39105, 699.0, 8482.299999999997, 14871.899999999985, 32368.360000000004, 2.6064219153850923, 80.41921282938323, 3.310475013484381], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 94, 17, 18.085106382978722, 32323.27659574467, 6490, 66756, 31708.0, 59406.5, 61954.75, 66756.0, 0.3838473757498295, 124.16645510185226, 1.4688773855195618], "isController": true}, {"data": ["2.5 Select patient", 77, 0, 0.0, 2193.2467532467535, 351, 22056, 773.0, 3493.0000000000005, 20713.999999999993, 22056.0, 0.38743502915825967, 9.410610530936939, 0.2686317096702777], "isController": false}, {"data": ["1.4 Select Organisations", 70, 2, 2.857142857142857, 4953.271428571429, 401, 31954, 764.5, 15532.3, 21599.100000000024, 31954.0, 0.5952330337327063, 8.325498202077362, 0.8548004746983444], "isController": false}, {"data": ["2.5 Select menacwy", 59, 0, 0.0, 505.89830508474586, 355, 787, 429.0, 706.0, 732.0, 787.0, 0.28642167095490073, 6.467983124180785, 0.19971198541191318], "isController": false}, {"data": ["2.3 Search by first/last name", 86, 4, 4.651162790697675, 7429.558139534887, 1139, 39105, 3715.0, 20027.399999999998, 31358.999999999975, 39105.0, 0.36541942501678376, 39.976695880745794, 0.3152066199871678], "isController": false}, {"data": ["2.5 Select td_ipv", 59, 0, 0.0, 474.9322033898304, 350, 976, 399.0, 694.0, 767.0, 976.0, 0.2835734094655843, 6.496157264886403, 0.1974490634267203], "isController": false}, {"data": ["4.0 Vaccination for hpv", 77, 0, 0.0, 2379.142857142857, 2115, 3561, 2294.0, 2715.8, 3073.8999999999987, 3561.0, 0.3901163762748446, 19.546008993892396, 2.27306812438886], "isController": true}, {"data": ["5.8 Consent confirm", 1, 0, 0.0, 1219.0, 1219, 1219, 1219.0, 1219.0, 1219.0, 1219.0, 0.8203445447087777, 68.15268662838392, 1.7824869257588185], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 111.44285714285715, 104, 158, 109.0, 116.0, 139.9, 158.0, 1.2093778614744044, 7.288155061678271, 0.7286974028610425], "isController": false}, {"data": ["5.9 Patient home page", 1, 0, 0.0, 403.0, 403, 403, 403.0, 403.0, 403.0, 403.0, 2.4813895781637716, 53.6164314516129, 1.8489260235732008], "isController": false}, {"data": ["2.4 Patient attending session", 81, 5, 6.172839506172839, 8161.308641975313, 1302, 34769, 4916.0, 29488.39999999999, 33162.09999999999, 34769.0, 0.37089610330143324, 33.804905537398696, 0.5420974947341911], "isController": false}, {"data": ["5.4 Consent route", 1, 0, 0.0, 455.0, 455, 455, 455.0, 455.0, 455.0, 455.0, 2.197802197802198, 24.982829670329668, 3.4190418956043955], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 326.8857142857143, 305, 536, 320.0, 352.8, 371.85, 536.0, 1.1862195183948756, 6.122236479215739, 0.6429217116300351], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 4440.657142857143, 467, 22658, 682.0, 12850.3, 15343.0, 22658.0, 0.8042464211034261, 7.804488951664791, 1.2652743988258002], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 58, 0, 0.0, 2168.258620689655, 914, 3530, 2199.5, 2572.0, 2792.0499999999997, 3530.0, 0.29812081088860565, 15.819467208638308, 1.7069916156734446], "isController": true}, {"data": ["2.1 Open session", 94, 5, 5.319148936170213, 9569.734042553191, 1763, 35881, 5902.0, 21000.5, 31276.75, 35881.0, 0.3946197377038169, 6.315469585680761, 0.24382904857810953], "isController": false}, {"data": ["4.3 Vaccination confirm", 189, 0, 0.0, 1189.1534391534387, 908, 2565, 1203.0, 1393.0, 1612.0, 2410.199999999999, 0.5932110293309898, 12.063533067983867, 1.3809682787071764], "isController": false}, {"data": ["5.6 Consent questions", 1, 0, 0.0, 490.0, 490, 490, 490.0, 490.0, 490.0, 490.0, 2.0408163265306123, 24.507732780612244, 3.9580676020408165], "isController": false}, {"data": ["4.1 Vaccination questions", 194, 0, 0.0, 595.896907216495, 453, 1164, 528.0, 738.0, 842.5, 1046.2000000000014, 0.4887216150989787, 5.668175362416048, 0.9574127685449699], "isController": false}, {"data": ["5.3 Consent parent details", 1, 0, 0.0, 527.0, 527, 527, 527.0, 527.0, 527.0, 527.0, 1.8975332068311195, 21.449166864326376, 3.43186669829222], "isController": false}, {"data": ["5.2 Consent who", 1, 0, 0.0, 542.0, 542, 542, 542.0, 542.0, 542.0, 542.0, 1.8450184501845017, 35.33462580719557, 2.902660862546125], "isController": false}, {"data": ["1.0 Login", 70, 6, 8.571428571428571, 14968.114285714284, 1650, 54021, 7075.5, 48103.39999999999, 52547.05, 54021.0, 0.6443892110834945, 28.90455092688484, 3.0508161304427874], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 59, 0, 0.0, 2271.1694915254234, 2086, 2992, 2224.0, 2451.0, 2683.0, 2992.0, 0.2843332385555871, 14.785662549155917, 1.6856260436596098], "isController": true}, {"data": ["2.5 Select hpv", 77, 0, 0.0, 1109.9350649350645, 348, 14117, 665.0, 2149.0, 3079.8999999999805, 14117.0, 0.39147300615680275, 7.997264058075274, 0.291693265329727], "isController": false}, {"data": ["5.1 Consent start", 1, 0, 0.0, 873.0, 873, 873, 873.0, 873.0, 873.0, 873.0, 1.1454753722794961, 13.083476517754868, 2.4352537943871706], "isController": false}, {"data": ["5.5 Consent agree", 1, 0, 0.0, 538.0, 538, 538, 538.0, 538.0, 538.0, 538.0, 1.858736059479554, 29.293244656133826, 2.85708062267658], "isController": false}, {"data": ["1.5 Open Sessions list", 68, 4, 5.882352941176471, 5286.85294117647, 300, 35180, 1086.0, 19192.20000000001, 32418.25, 35180.0, 0.613231368588125, 6.298268015925979, 0.36650156013274654], "isController": false}, {"data": ["4.2 Vaccination batch", 194, 0, 0.0, 528.8556701030926, 447, 1246, 482.5, 674.5, 727.0, 1094.0000000000018, 0.4884644339981318, 9.845338315911855, 0.7817702917316064], "isController": false}, {"data": ["5.0 Consent for hpv", 1, 0, 0.0, 5876.0, 5876, 5876, 5876.0, 5876.0, 5876.0, 5876.0, 0.17018379850238255, 34.32328007998638, 2.565055416099387], "isController": true}, {"data": ["5.7 Consent triage", 1, 0, 0.0, 829.0, 829, 829, 829.0, 829.0, 829.0, 829.0, 1.2062726176115801, 19.28269187273824, 1.9472349969843186], "isController": false}, {"data": ["2.2 Session register", 89, 3, 3.3707865168539324, 7527.4606741573, 745, 35731, 4186.0, 17255.0, 27192.5, 35731.0, 0.3743270524899058, 43.07422252875799, 0.23414745305139636], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 23, 100.0, 1.4781491002570695], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1556, 23, "502/Bad Gateway", 23, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Select Organisations", 70, 2, "502/Bad Gateway", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 86, 4, "502/Bad Gateway", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 81, 5, "502/Bad Gateway", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 94, 5, "502/Bad Gateway", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.5 Open Sessions list", 68, 4, "502/Bad Gateway", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.2 Session register", 89, 3, "502/Bad Gateway", 3, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
