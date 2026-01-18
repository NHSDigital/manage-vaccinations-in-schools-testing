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

    var data = {"OkPercent": 99.65937809031975, "KoPercent": 0.3406219096802549};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4587284861257464, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1571627260083449, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4778523489932886, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.005235602094240838, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [6.393861892583121E-4, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0027624309392265192, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8414473684210526, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9191655801825294, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0026455026455026454, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7579617834394905, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.36975397973950797, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.52088948787062, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5880861850443599, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6609195402298851, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8558441558441559, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6832901554404145, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9101, 31, 0.3406219096802549, 1563.7956268541961, 180, 23724, 674.0, 2445.000000000001, 9027.599999999999, 10687.919999999998, 5.043714781004907, 2060.1703681869185, 21.22358800509193], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 719, 0, 0.0, 1862.7552155771907, 1130, 6789, 1680.0, 2623.0, 3330.0, 4182.399999999997, 0.43628005417396837, 175.98874932475954, 2.2928233628196555], "isController": false}, {"data": ["4.1 Vaccination questions", 745, 0, 0.0, 1029.1812080536915, 446, 2321, 1029.0, 1238.8, 1476.6999999999998, 1812.7799999999997, 0.4389875121310811, 173.30902491390395, 2.2067684950742064], "isController": false}, {"data": ["2.0 Register attendance", 764, 31, 4.057591623036649, 3208.07853403141, 1332, 8840, 2988.0, 4261.0, 5304.25, 7458.200000000004, 0.4357340721801475, 870.9561784357403, 8.089524557593037], "isController": true}, {"data": ["1.0 Login", 782, 0, 0.0, 11687.694373401528, 1351, 27126, 11101.5, 13148.900000000003, 17130.34999999998, 24130.269999999993, 0.43615270922223154, 724.8457211535109, 7.314946321878747], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 181, 0, 0.0, 3519.7071823204437, 1273, 6681, 3356.0, 4489.2, 5340.8, 6587.52, 0.10689710769499716, 126.25126841114428, 1.5631441141330378], "isController": true}, {"data": ["2.5 Select patient", 760, 0, 0.0, 507.24342105263133, 272, 2363, 364.5, 972.0, 1087.7999999999997, 1457.7699999999995, 0.43662352136869986, 177.61740832521843, 1.573249520288631], "isController": false}, {"data": ["2.3 Search by first/last name", 767, 0, 0.0, 402.5749674054759, 268, 4651, 358.0, 580.0, 662.5999999999999, 1046.239999999998, 0.4350094715230436, 177.32743371085905, 1.6387117310768045], "isController": false}, {"data": ["4.0 Vaccination for flu", 189, 0, 0.0, 3570.5079365079364, 1367, 8586, 3331.0, 4447.0, 5243.5, 7610.399999999994, 0.11284067136020175, 133.8940157054512, 1.656891417496752], "isController": true}, {"data": ["4.0 Vaccination for hpv", 189, 0, 0.0, 3528.1164021163995, 1678, 7236, 3360.0, 4278.0, 4857.0, 6565.499999999995, 0.11282740094022835, 133.65265768412806, 1.6593153029624654], "isController": true}, {"data": ["1.2 Sign-in page", 785, 0, 0.0, 598.1872611464971, 180, 2390, 482.0, 1050.8, 1115.0, 1595.84, 0.43712694556293874, 175.44261637339022, 1.8769524322007756], "isController": false}, {"data": ["2.4 Patient attending session", 691, 31, 4.486251808972503, 1373.6164978292313, 286, 6125, 1194.0, 2043.6000000000001, 2534.6, 3815.2000000000116, 0.3959910349005065, 161.55334031206644, 1.7446894319606026], "isController": false}, {"data": ["1.4 Open Sessions list", 778, 0, 0.0, 9740.188946015418, 7131, 23724, 9189.5, 10881.2, 14374.39999999998, 21278.380000000005, 0.43444634615545696, 199.79445935633674, 1.5639352993240394], "isController": false}, {"data": ["4.2 Vaccination batch", 742, 0, 0.0, 700.9568733153633, 422, 2143, 670.5, 941.3000000000004, 1117.7, 1469.0800000000022, 0.438768444388465, 174.38103787068394, 1.9890264832531783], "isController": false}, {"data": ["1.1 Homepage", 789, 0, 0.0, 670.0164765525991, 423, 5121, 611.0, 883.0, 1129.5, 1629.200000000002, 0.43869501299960634, 175.88648595824975, 1.870764346480654], "isController": false}, {"data": ["1.3 Sign-in", 783, 0, 0.0, 728.0191570881225, 361, 2919, 625.0, 1113.6, 1281.1999999999998, 1746.039999999997, 0.43695903299794076, 175.70411380815656, 2.024404857820897], "isController": false}, {"data": ["2.2 Session register", 770, 0, 0.0, 458.10909090909115, 268, 1959, 385.0, 677.8, 928.8499999999991, 1358.5599999999977, 0.43579717207253255, 182.4908594903607, 1.5770249879802047], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 182, 0, 0.0, 3531.8516483516473, 1625, 8134, 3393.0, 4280.6, 5133.599999999999, 6824.25999999998, 0.10808820472618644, 127.77821101679376, 1.5804646298795588], "isController": true}, {"data": ["2.1 Open session", 772, 0, 0.0, 600.5362694300519, 299, 4193, 551.0, 869.0, 1024.3999999999996, 1544.0199999999995, 0.43524074394595347, 173.7363031919017, 1.57116288349248], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 31, 100.0, 0.3406219096802549], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9101, 31, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 31, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 691, 31, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 31, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
