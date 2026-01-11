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

    var data = {"OkPercent": 99.91364421416235, "KoPercent": 0.08635578583765112};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8260514018691589, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.483695652173913, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9893350062735258, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3722153465346535, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4907862407862408, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.44415584415584414, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9956602603843769, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9966070326958667, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.45197044334975367, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.45893719806763283, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9886572654812998, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5657805044308112, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9431818181818182, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9905778894472361, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.994488671157379, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9904791154791155, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9929099876695437, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.4496124031007752, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9298892988929889, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20844, 18, 0.08635578583765112, 250.31908462866969, 0, 2769, 128.0, 628.0, 786.0, 1241.9700000000048, 5.486608820900284, 2151.9287746609825, 41.542822301663854], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1564, 0, 0.0, 817.4514066496157, 495, 2769, 717.0, 1185.0, 1389.0, 1859.199999999999, 0.4514174913309947, 189.05939773368, 4.618869002645151], "isController": false}, {"data": ["4.1 Vaccination questions", 1594, 0, 0.0, 161.2509410288582, 91, 1027, 125.0, 246.5, 352.75, 603.2499999999998, 0.45430578712610264, 186.16736132264188, 4.230348845442691], "isController": false}, {"data": ["2.0 Register attendance", 1616, 17, 1.051980198019802, 1321.797648514851, 407, 3372, 1280.0, 1809.4999999999998, 2040.0, 2513.49, 0.45328347215139664, 948.4138476763998, 16.679711922978694], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 40.0, 40, 40, 40.0, 40.0, 40.0, 40.0, 25.0, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1628, 1, 0.06142506142506143, 801.4920147420152, 477, 2445, 737.0, 1086.6000000000008, 1248.0, 1591.3900000000003, 0.45379664446928375, 785.1252086013349, 14.848831377386404], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 385, 0, 0.0, 1130.1168831168834, 221, 3107, 1020.0, 1609.8000000000004, 1857.1999999999998, 2250.9399999999996, 0.110810308294425, 136.98023354567658, 3.1273322894078874], "isController": true}, {"data": ["2.5 Select patient", 1613, 0, 0.0, 120.39057656540618, 64, 1010, 95.0, 175.60000000000014, 262.29999999999995, 493.4399999999996, 0.4546716596924976, 191.6388729976865, 3.2544996889635716], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.358506944444445, 13.715277777777779], "isController": false}, {"data": ["2.3 Search by first/last name", 1621, 0, 0.0, 121.17334978408398, 67, 842, 99.0, 175.79999999999995, 260.0, 470.3399999999999, 0.45380014932572466, 193.09594873529804, 3.3691008058347056], "isController": false}, {"data": ["4.0 Vaccination for flu", 406, 0, 0.0, 1102.0418719211834, 212, 2634, 1022.0, 1531.4, 1720.4499999999998, 2253.6600000000003, 0.11623738996098318, 143.54011644710397, 3.277671620498092], "isController": true}, {"data": ["4.0 Vaccination for hpv", 414, 0, 0.0, 1079.1545893719813, 213, 2915, 999.5, 1529.5, 1704.25, 2479.4500000000044, 0.11858186402097352, 145.6129288151316, 3.332238881267474], "isController": true}, {"data": ["1.2 Sign-in page", 1631, 0, 0.0, 143.33169834457416, 18, 1915, 110.0, 232.5999999999999, 362.59999999999945, 607.7200000000003, 0.4536938776361742, 189.34893055263865, 3.8171842597640846], "isController": false}, {"data": ["Debug Sampler", 1621, 0, 0.0, 0.4083898827884022, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.4538217474404985, 2.6278854190026166, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1467, 17, 1.1588275391956373, 665.7334696659857, 110, 2281, 582.0, 978.6000000000001, 1146.7999999999993, 1591.2799999999997, 0.41177907084452603, 175.64736961031159, 3.580928448912869], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 37.03703703703704, 11.574074074074074, 21.846064814814817], "isController": false}, {"data": ["1.4 Open Sessions list", 1628, 1, 0.06142506142506143, 358.8427518427511, 231, 1301, 309.0, 513.0, 610.1999999999998, 896.170000000001, 0.4540102659864321, 217.04730735815247, 3.248933893766199], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 142.578125, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1592, 0, 0.0, 147.81155778894473, 87, 1032, 113.0, 229.0, 344.0499999999997, 615.9799999999991, 0.4547747636570975, 187.56292107997436, 4.002670592134168], "isController": false}, {"data": ["1.1 Homepage", 1633, 0, 0.0, 141.85548071034904, 36, 1033, 115.0, 216.0, 293.5999999999999, 505.6600000000001, 0.45374181396141056, 189.172735801344, 3.809339488902775], "isController": false}, {"data": ["1.3 Sign-in", 1628, 0, 0.0, 157.3777641277637, 74, 934, 117.0, 299.2000000000003, 365.1999999999998, 609.4200000000001, 0.45412272582982, 189.73117394298612, 3.9769348133396596], "isController": false}, {"data": ["2.2 Session register", 1622, 0, 0.0, 138.50000000000009, 68, 1019, 97.0, 274.0, 348.24999999999955, 587.7799999999997, 0.4535191774023305, 196.65445261002455, 3.2536611315086783], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 387, 0, 0.0, 1140.1860465116279, 210, 2584, 1069.0, 1565.1999999999998, 1800.9999999999968, 2229.4000000000005, 0.11176688719688647, 138.14142874642533, 3.1453663315862177], "isController": true}, {"data": ["2.1 Open session", 1626, 0, 0.0, 337.2140221402213, 114, 1734, 284.0, 560.0, 708.6499999999999, 1078.1400000000003, 0.4541031825204347, 190.5888594168565, 3.2538647709313357], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, 94.44444444444444, 0.08155824218000383], "isController": false}, {"data": ["Assertion failed", 1, 5.555555555555555, 0.004797543657647284], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20844, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1467, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 1628, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
