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

    var data = {"OkPercent": 99.9574784734772, "KoPercent": 0.04252152652280217};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4838952564209822, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7692307692307693, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.09101654846335698, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.7734839476813318, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8226950354609929, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.02619047619047619, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.02857142857142857, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6674311926605505, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.16666666666666666, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.668, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5913793103448276, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.020202020202020204, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.414906103286385, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.07765151515151515, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.6178266178266179, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.07528735632183908, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.020100502512562814, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.03571428571428571, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.5702576112412178, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.6254589963280294, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.7588235294117647, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.7692307692307693, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9407, 4, 0.04252152652280217, 1455.642606569577, 4, 22960, 575.0, 3698.800000000003, 5691.400000000003, 12822.280000000006, 4.720510359078941, 1857.066708438546, 22.684380371700673], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 13, 0, 0.0, 1517.3846153846155, 77, 14499, 177.0, 9652.199999999995, 14499.0, 14499.0, 0.008017436073281831, 3.240383625065219, 0.03516963487825215], "isController": false}, {"data": ["2.0 Register attendance", 846, 1, 0.1182033096926714, 4264.630023640662, 520, 27269, 2949.0, 8734.500000000002, 12085.799999999997, 20700.3, 0.47773991748539396, 758.843338092262, 8.1377178929552], "isController": true}, {"data": ["2.5 Select patient", 841, 0, 0.0, 778.6409036860874, 61, 19290, 189.0, 1985.0000000000018, 2931.8999999999996, 9277.840000000017, 0.4779150402306721, 187.0581689926193, 1.9903999579906428], "isController": false}, {"data": ["2.3 Search by first/last name", 846, 0, 0.0, 618.0342789598111, 62, 15428, 160.0, 1416.8000000000004, 2510.2, 8005.239999999992, 0.4779094005795923, 187.11249521596307, 2.0686242954578833], "isController": false}, {"data": ["4.0 Vaccination for flu", 210, 1, 0.47619047619047616, 7179.585714285716, 223, 26270, 5567.0, 14633.800000000001, 20922.899999999998, 23873.689999999995, 0.1225807091819372, 138.21433782867683, 2.0541298170570474], "isController": true}, {"data": ["4.0 Vaccination for hpv", 210, 0, 0.0, 6746.914285714282, 313, 26047, 5324.5, 12669.1, 17369.149999999987, 24546.379999999983, 0.12298134899998596, 138.34608766132519, 2.058617650839553], "isController": true}, {"data": ["1.2 Sign-in page", 872, 0, 0.0, 1084.8222477064219, 13, 21535, 399.0, 2419.5, 3939.4999999999973, 12541.459999999988, 0.48593464401943737, 188.33075130486966, 2.391577878758749], "isController": false}, {"data": ["7.1 Name search", 13, 0, 0.0, 7043.076923076923, 5327, 11321, 6524.0, 10328.599999999999, 11321.0, 11321.0, 0.007966433127615517, 3.0940137348967154, 0.03452460137960238], "isController": false}, {"data": ["2.4 Patient attending session", 36, 1, 2.7777777777777777, 2957.6388888888887, 468, 8500, 1854.5, 7083.000000000001, 7436.649999999998, 8500.0, 0.029159855950311606, 11.564668036555524, 0.14839458919635437], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 10.44921875, 19.661458333333336], "isController": false}, {"data": ["1.1 Homepage", 875, 0, 0.0, 1134.3051428571428, 30, 22145, 380.0, 2960.999999999999, 4490.599999999999, 8384.400000000001, 0.48602227703936335, 187.8144179003185, 2.378627739707576], "isController": false}, {"data": ["1.3 Sign-in", 870, 0, 0.0, 1345.6252873563226, 76, 19506, 672.5, 3220.3999999999987, 4908.949999999995, 11269.529999999999, 0.4852600854615521, 188.18524630766575, 2.544186033378085], "isController": false}, {"data": ["Run some searches", 13, 0, 0.0, 15781.692307692307, 9562, 30326, 14398.0, 28827.199999999997, 30326.0, 30326.0, 0.00803861503319948, 17.647034747184012, 0.17606813290489576], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 198, 0, 0.0, 6910.909090909088, 249, 25577, 5501.0, 13623.299999999997, 20050.14999999999, 24460.27999999999, 0.11782656405837533, 134.5077945452103, 1.9785822604222953], "isController": true}, {"data": ["2.1 Open session", 852, 0, 0.0, 1873.3615023474176, 229, 18821, 981.5, 4492.300000000002, 5901.099999999999, 12200.950000000032, 0.47827524515816483, 186.35499180139675, 1.9942985929683996], "isController": false}, {"data": ["4.3 Vaccination confirm", 792, 1, 0.12626262626262627, 4504.789141414143, 893, 22960, 3271.5, 9347.000000000004, 11831.699999999997, 19947.249999999996, 0.4738573725206998, 184.04084316715767, 2.861890922946424], "isController": false}, {"data": ["4.1 Vaccination questions", 819, 1, 0.1221001221001221, 1386.6923076923078, 47, 17507, 510.0, 3591.0, 5362.0, 12766.599999999964, 0.47559180402598045, 179.4791059126325, 2.7188055973133998], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 39.0, 39, 39, 39.0, 39.0, 39.0, 39.0, 25.64102564102564, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 870, 0, 0.0, 4682.604597701149, 466, 25211, 3488.0, 9437.5, 12496.29999999999, 18991.119999999977, 0.4852590028094823, 774.8836772815679, 9.289204238681613], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 199, 0, 0.0, 7417.738693467339, 397, 31539, 5924.0, 15018.0, 17330.0, 26330.0, 0.11776548571753208, 134.92563963968496, 1.9814665965819012], "isController": true}, {"data": ["7.0 Open Children Search", 14, 0, 0.0, 1892.642857142857, 1306, 2930, 1732.5, 2705.5, 2930.0, 2930.0, 0.008029852698087862, 3.708673950842389, 0.03342280554880028], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.525213068181818, 14.026988636363637], "isController": false}, {"data": ["7.5 year group", 13, 0, 0.0, 3111.6923076923076, 1557, 11438, 1690.0, 9299.599999999999, 11438.0, 11438.0, 0.00800992738076607, 3.7520588979202527, 0.03530878520363084], "isController": false}, {"data": ["7.2 No Consent search", 13, 0, 0.0, 3446.076923076923, 1775, 16972, 2402.0, 11599.999999999996, 16972.0, 16972.0, 0.007997726184924656, 4.249073806593141, 0.0352003288142079], "isController": false}, {"data": ["1.4 Open Sessions list", 854, 0, 0.0, 1132.817330210774, 382, 14906, 668.5, 2234.5, 3554.5, 7759.850000000046, 0.478434856948538, 211.66751888459132, 1.9911373566726256], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.533203125, 153.564453125], "isController": false}, {"data": ["4.2 Vaccination batch", 817, 1, 0.12239902080783353, 1304.5997552019578, 63, 21488, 552.0, 2935.2, 4823.599999999997, 15168.099999999975, 0.47574154830873006, 180.958652656772, 2.476896878397374], "isController": false}, {"data": ["2.2 Session register", 850, 0, 0.0, 864.9729411764702, 62, 21171, 216.0, 2216.0, 3274.699999999998, 12483.950000000024, 0.47829578148747737, 191.5185049868314, 1.998580134132425], "isController": false}, {"data": ["7.3 Due vaccination", 13, 0, 0.0, 663.4615384615385, 275, 2090, 332.0, 1903.6, 2090.0, 2090.0, 0.008019053270570876, 3.2318652098154446, 0.035067093452504694], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 1, 25.0, 0.010630381630700542], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 1, 25.0, 0.010630381630700542], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, 25.0, 0.010630381630700542], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 1, 25.0, 0.010630381630700542], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9407, 4, "Test failed: text expected to contain /Check and confirm/", 1, "Test failed: text expected to contain /Which batch did you use?/", 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "Test failed: text expected to contain /Vaccination outcome recorded for/", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 36, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 792, 1, "Test failed: text expected to contain /Vaccination outcome recorded for/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 819, 1, "Test failed: text expected to contain /Which batch did you use?/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 817, 1, "Test failed: text expected to contain /Check and confirm/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
