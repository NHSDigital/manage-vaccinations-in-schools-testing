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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.38698363211223696, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2824427480916031, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.6875, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4142857142857143, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.7291666666666666, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.18253968253968253, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8541666666666666, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.03260869565217391, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.7717391304347826, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.7058823529411765, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.20491803278688525, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.7571428571428571, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.4928571428571429, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.208955223880597, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.07246376811594203, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1047, 0, 0.0, 1127.0534861509077, 157, 6251, 902.0, 2217.4, 2730.999999999999, 4084.8399999999997, 1.7447789946606762, 50.005402635978605, 2.2411549224598217], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 131, 0, 0.0, 1487.1603053435122, 1151, 2979, 1314.0, 1882.8, 2357.7999999999997, 2869.2400000000025, 0.3369315565980715, 7.043970331697544, 0.7841048157743125], "isController": false}, {"data": ["4.1 Vaccination questions", 140, 0, 0.0, 797.5428571428573, 591, 1413, 890.0, 959.9, 1061.2499999999993, 1380.2000000000003, 0.32807630117404446, 3.808921002448855, 0.6441815704602442], "isController": false}, {"data": ["2.0 Register attendance", 61, 0, 0.0, 8930.000000000002, 4675, 14849, 8825.0, 12045.800000000001, 13272.099999999999, 14849.0, 0.12028568836935988, 34.14943891532874, 0.5115742777682469], "isController": true}, {"data": ["1.0 Login", 35, 0, 0.0, 3000.4000000000005, 2185, 6195, 2480.0, 4665.799999999998, 6085.4, 6195.0, 0.5679236710586097, 26.762848385676964, 2.703738180088596], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 24, 0, 0.0, 2946.208333333333, 2681, 3741, 2876.5, 3372.0, 3659.5, 3741.0, 0.3002589733645269, 15.844048792865097, 1.7799043080907284], "isController": true}, {"data": ["2.5 Select patient", 56, 0, 0.0, 713.9821428571427, 446, 3201, 567.5, 1178.3000000000002, 1327.25, 3201.0, 0.11312468562447855, 2.8551692962685014, 0.07843606132165995], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 956.5428571428572, 555, 4093, 600.0, 2016.1999999999987, 3075.3999999999946, 4093.0, 0.5709624796084829, 8.204240161092986, 0.8252192088091355], "isController": false}, {"data": ["2.5 Select menacwy", 24, 0, 0.0, 628.9166666666667, 445, 1168, 509.0, 962.5, 1117.5, 1168.0, 0.30874917988499095, 7.1502269788892745, 0.21528018988074563], "isController": false}, {"data": ["2.3 Search by first/last name", 63, 0, 0.0, 2050.84126984127, 787, 5500, 1849.0, 3454.2000000000003, 3917.799999999999, 5500.0, 0.12333159755529367, 9.137039528388781, 0.1063685323099421], "isController": false}, {"data": ["2.5 Select td_ipv", 24, 0, 0.0, 518.3333333333335, 459, 909, 483.0, 704.0, 904.5, 909.0, 0.2951412373796377, 6.931351608519744, 0.20550361548015791], "isController": false}, {"data": ["4.0 Vaccination for flu", 46, 0, 0.0, 2812.0869565217395, 2673, 3133, 2787.5, 2990.9, 3058.65, 3133.0, 0.1366055307421838, 7.148937706393139, 0.7982769699408439], "isController": true}, {"data": ["4.0 Vaccination for hpv", 46, 0, 0.0, 2762.826086956521, 1267, 4072, 2833.5, 3216.4000000000005, 3650.1499999999996, 4072.0, 0.1401460565641671, 6.711676289648386, 0.7731240041251688], "isController": true}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 158.85714285714286, 157, 163, 158.0, 161.0, 161.39999999999998, 163.0, 0.617861493106431, 3.7234602284763536, 0.37228568481119917], "isController": false}, {"data": ["2.5 Select hpv", 46, 0, 0.0, 655.1086956521739, 444, 975, 481.0, 937.6, 952.55, 975.0, 0.14062762721450298, 3.0719153396845047, 0.10478406207486891], "isController": false}, {"data": ["2.5 Select flu", 51, 0, 0.0, 731.901960784314, 437, 1933, 509.0, 1386.4, 1689.6, 1933.0, 0.10574901404595728, 2.236501335988463, 0.07332207028577116], "isController": false}, {"data": ["2.4 Patient attending session", 61, 0, 0.0, 2055.934426229509, 1129, 5572, 1769.0, 3378.2000000000003, 4617.9, 5572.0, 0.12191758371340974, 7.967473363006607, 0.18120953360528283], "isController": false}, {"data": ["1.5 Open Sessions list", 35, 0, 0.0, 665.6285714285711, 400, 2000, 452.0, 1326.9999999999998, 1819.1999999999991, 2000.0, 0.5567397321286546, 6.604760025291891, 0.3327389805300162], "isController": false}, {"data": ["4.2 Vaccination batch", 140, 0, 0.0, 690.3714285714286, 587, 1687, 616.5, 908.0, 984.6999999999995, 1618.1200000000006, 0.3270844625535017, 6.627564893411351, 0.5255733505889857], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 476.4000000000001, 463, 648, 472.0, 478.8, 516.7999999999993, 648.0, 0.6003430531732419, 3.098450230488851, 0.3253812446397942], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 742.9714285714285, 590, 1188, 679.0, 1081.6, 1150.3999999999999, 1188.0, 0.5836640763099089, 5.663935474894107, 0.9182449481789681], "isController": false}, {"data": ["2.2 Session register", 67, 0, 0.0, 1855.6417910447751, 802, 5400, 1747.0, 2815.6000000000004, 3655.599999999996, 5400.0, 0.12476118474710722, 12.438521729511235, 0.07996332172464649], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 24, 0, 0.0, 3165.458333333333, 1900, 4267, 3038.5, 3840.0, 4167.0, 4267.0, 0.2841750044402344, 15.678791590195962, 1.6561727584216448], "isController": true}, {"data": ["2.1 Open session", 69, 0, 0.0, 2289.3188405797096, 1383, 6251, 2035.0, 3562.0, 3878.5, 6251.0, 0.1272933558402745, 2.226639247862302, 0.08056723948676796], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1047, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
