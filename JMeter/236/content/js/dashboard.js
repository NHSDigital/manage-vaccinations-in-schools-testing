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

    var data = {"OkPercent": 99.91672614798954, "KoPercent": 0.08327385201046872};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7217354033717497, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.06772334293948126, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9650655021834061, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5769230769230769, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9713876967095851, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.28362573099415206, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.2823529411764706, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3076923076923077, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9452149791955617, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3614916286149163, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9516574585635359, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9243055555555556, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.254601226993865, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8914285714285715, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.40625, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9437781109445277, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.4230769230769231, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.38472222222222224, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.2808641975308642, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5357142857142857, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.8207681365576103, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.948948948948949, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9628571428571429, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.7692307692307693, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8406, 7, 0.08327385201046872, 450.3639067332849, 1, 27234, 220.0, 1071.0, 1438.5999999999985, 2672.6700000000055, 4.480819788528334, 1942.5397525709343, 21.565145115747846], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 13, 0, 0.0, 153.23076923076925, 111, 377, 125.0, 320.19999999999993, 377.0, 377.0, 0.008078985130317138, 3.471754508539798, 0.03537651158588614], "isController": false}, {"data": ["2.0 Register attendance", 694, 7, 1.0086455331412103, 2279.8227665706054, 448, 6232, 2067.5, 3422.5, 4198.0, 5558.65, 0.39421089373971513, 863.6849598177541, 8.516625770777441], "isController": true}, {"data": ["2.5 Select patient", 687, 0, 0.0, 199.08442503639, 84, 2449, 127.0, 355.8000000000002, 541.0000000000002, 1538.48, 0.39231093411117873, 165.39345385824527, 1.631959905408523], "isController": false}, {"data": ["7.1 Full name search", 13, 0, 0.0, 696.5384615384615, 358, 1570, 574.0, 1375.6, 1570.0, 1570.0, 0.007954913995141383, 3.416336176004002, 0.03442627668720666], "isController": false}, {"data": ["2.3 Search by first/last name", 699, 0, 0.0, 184.5579399141632, 80, 2069, 120.0, 355.0, 523.0, 1070.0, 0.3947713968638547, 167.9694449268487, 1.7068727074032344], "isController": false}, {"data": ["4.0 Vaccination for flu", 171, 0, 0.0, 1616.7836257309937, 277, 5776, 1374.0, 2543.4, 2959.4, 4346.080000000002, 0.10035329053157901, 122.71099545255812, 1.6737256993553329], "isController": true}, {"data": ["4.0 Vaccination for hpv", 170, 0, 0.0, 1740.6529411764714, 232, 6120, 1476.0, 3013.0, 4037.2, 5747.9599999999955, 0.10100109912960817, 123.29509529657932, 1.6868181497489825], "isController": true}, {"data": ["7.6 First name search", 13, 0, 0.0, 2233.846153846154, 845, 9944, 1247.0, 7462.799999999997, 9944.0, 9944.0, 0.008078312403254441, 4.174404822566082, 0.03490204774344771], "isController": false}, {"data": ["1.2 Sign-in page", 721, 0, 0.0, 239.82108183079083, 18, 1850, 146.0, 504.2000000000003, 789.6999999999995, 1490.7999999999997, 0.4014072078482068, 167.71045186895836, 1.9632544557383136], "isController": false}, {"data": ["2.4 Patient attending session", 657, 7, 1.06544901065449, 1375.6666666666658, 261, 5002, 1147.0, 2226.8, 2952.0, 4452.359999999993, 0.3728548079542359, 194.3793432335649, 1.8985779811713999], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 10.416666666666668, 19.661458333333336], "isController": false}, {"data": ["1.1 Homepage", 724, 0, 0.0, 238.78867403314945, 36, 2717, 162.0, 453.5, 713.25, 1203.75, 0.40219920748979365, 168.07675271741394, 1.9544427414361845], "isController": false}, {"data": ["1.3 Sign-in", 720, 0, 0.0, 301.16249999999957, 99, 2940, 192.0, 640.7999999999997, 893.0499999999987, 1451.2999999999975, 0.40169806699542676, 168.22639456789142, 2.1072225852924946], "isController": false}, {"data": ["Run some searches", 13, 0, 0.0, 12427.307692307693, 7651, 47217, 9197.0, 34526.999999999985, 47217.0, 47217.0, 0.007995045531784303, 31.90922489686391, 0.27851490645489224], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 163, 0, 0.0, 1715.2085889570558, 336, 7217, 1510.0, 2792.0, 3711.799999999999, 5999.079999999972, 0.09816781516987849, 120.90052857703493, 1.6462376544938575], "isController": true}, {"data": ["2.1 Open session", 700, 0, 0.0, 388.34857142857146, 106, 3346, 279.5, 766.7999999999997, 1017.8499999999998, 1799.5800000000004, 0.3939289914855062, 165.30132809026742, 1.641383621065634], "isController": false}, {"data": ["7.7 Partial name search", 13, 0, 0.0, 791.6153846153845, 534, 1364, 732.0, 1203.1999999999998, 1364.0, 1364.0, 0.008143735681903179, 4.208067415566688, 0.03517675371432653], "isController": false}, {"data": ["4.3 Vaccination confirm", 640, 0, 0.0, 1194.9234375000008, 580, 5379, 958.0, 2075.1999999999994, 2601.5999999999995, 4276.1000000000095, 0.38662518500619203, 161.921782496904, 2.3332088946446374], "isController": false}, {"data": ["4.1 Vaccination questions", 667, 0, 0.0, 267.93403298350864, 109, 2335, 167.0, 511.20000000000005, 755.8000000000002, 1508.4800000000018, 0.39230586447273386, 160.73683922175664, 2.2403774093064714], "isController": false}, {"data": ["7.7 Last name search", 13, 0, 0.0, 1747.4615384615386, 406, 5459, 1083.0, 5365.4, 5459.0, 5459.0, 0.008123827122459194, 4.1989354046775125, 0.03513286714543088], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 720, 0, 0.0, 1263.0291666666656, 436, 4888, 1111.5, 1990.4999999999995, 2332.0, 3147.0499999999965, 0.40176463957805786, 691.7197896793499, 7.654754738904599], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 162, 0, 0.0, 1632.4259259259247, 230, 4026, 1470.5, 2643.5000000000023, 3326.449999999999, 4019.07, 0.0962795673362653, 117.78534534073013, 1.6074406796029954], "isController": true}, {"data": ["7.0 Open Children Search", 14, 0, 0.0, 760.0714285714286, 364, 1569, 699.5, 1392.5, 1569.0, 1569.0, 0.007963101263914809, 3.947521371861756, 0.033106082479812116], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.812686011904762, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 13, 0, 0.0, 1832.846153846154, 1616, 2318, 1784.0, 2191.6, 2318.0, 2318.0, 0.008071696534013508, 4.173595236666799, 0.035541658957161645], "isController": false}, {"data": ["7.2 No Consent search", 13, 0, 0.0, 4331.076923076924, 2134, 27234, 2421.0, 17578.39999999999, 27234.0, 27234.0, 0.007944976757887223, 4.386372608752981, 0.0349293693476074], "isController": false}, {"data": ["1.4 Open Sessions list", 703, 0, 0.0, 494.22048364153636, 266, 1652, 407.0, 803.6, 968.5999999999999, 1493.800000000002, 0.3934639096208362, 188.28170256395188, 1.6352277922714846], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 285.15625, 614.2578125], "isController": false}, {"data": ["4.2 Vaccination batch", 666, 0, 0.0, 259.9819819819824, 103, 2240, 167.0, 499.30000000000075, 753.65, 1268.6300000000006, 0.39223538834837096, 161.74660281676248, 2.039865117552828], "isController": false}, {"data": ["2.2 Session register", 700, 0, 0.0, 207.63714285714303, 79, 2880, 118.5, 420.79999999999995, 641.8999999999999, 1244.8000000000002, 0.3937444137511299, 171.21893435675943, 1.6440751854254942], "isController": false}, {"data": ["7.3 Due vaccination", 13, 0, 0.0, 640.6923076923076, 361, 1184, 499.0, 1183.6, 1184.0, 1184.0, 0.00807436866200879, 4.137656601992009, 0.03524590509169688], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 100.0, 0.08327385201046872], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8406, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 657, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
