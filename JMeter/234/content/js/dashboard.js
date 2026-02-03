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

    var data = {"OkPercent": 99.74145683453237, "KoPercent": 0.2585431654676259};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.533378287255563, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7884615384615384, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.04155313351498638, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.8063742289239205, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4807692307692308, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.8134732566012187, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.08862433862433862, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.09178082191780822, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.28846153846153844, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.738471673254282, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3051498847040738, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7448979591836735, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7410949868073878, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.08664772727272728, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5178933153274814, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.34, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.23319327731092437, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.6941948859709745, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.34, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.13672391017173052, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.08404558404558404, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.5794612794612795, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.7413554633471646, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.803921568627451, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.7115384615384616, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 17792, 46, 0.2585431654676259, 1439.6215152877626, 2, 33543, 469.0, 3681.7000000000007, 6625.799999999988, 14182.279999999999, 4.6181152005864, 1533.5421199560583, 22.305580918212485], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 26, 0, 0.0, 1273.1923076923076, 102, 13373, 208.5, 4578.200000000006, 12329.299999999996, 13373.0, 0.007466316860149568, 2.7244644627188133, 0.032708603777927614], "isController": false}, {"data": ["2.0 Register attendance", 1468, 38, 2.5885558583106265, 6312.809264305166, 561, 39680, 4318.0, 14088.400000000001, 18602.749999999996, 26669.579999999965, 0.4108587619829141, 667.4202193116073, 8.747928028050767], "isController": true}, {"data": ["2.5 Select patient", 1459, 0, 0.0, 820.369431117204, 77, 18456, 164.0, 1934.0, 3748.0, 11349.400000000001, 0.41067530614169284, 136.3641529883384, 1.7083533189510187], "isController": false}, {"data": ["7.1 Full name search", 26, 0, 0.0, 1265.0384615384617, 305, 5083, 788.5, 4440.200000000001, 5067.25, 5083.0, 0.007463412771793811, 2.3966281561444984, 0.032296135893389165], "isController": false}, {"data": ["2.3 Search by first/last name", 1477, 2, 0.13540961408259986, 807.5775220040625, 75, 18603, 159.0, 1948.6000000000001, 4445.099999999997, 10520.740000000005, 0.41295729708405177, 135.52186249743474, 1.7835855254098747], "isController": false}, {"data": ["4.0 Vaccination for flu", 378, 1, 0.26455026455026454, 5402.624338624338, 868, 35588, 3518.0, 12689.2, 15734.550000000005, 24062.599999999984, 0.10839427643809525, 103.10647715572702, 1.8321195611809702], "isController": true}, {"data": ["4.0 Vaccination for hpv", 365, 2, 0.547945205479452, 6365.764383561639, 234, 42248, 3874.0, 16980.60000000002, 19771.9, 29197.21999999995, 0.10482957009536906, 99.11464707922559, 1.764115680812771], "isController": true}, {"data": ["7.6 First name search", 26, 0, 0.0, 1931.1923076923076, 459, 6869, 1186.5, 5133.1, 6268.049999999997, 6869.0, 0.0074564029853143275, 3.2097420311306255, 0.032213430896064627], "isController": false}, {"data": ["1.2 Sign-in page", 1518, 1, 0.06587615283267458, 1029.2450592885377, 14, 23015, 255.0, 2614.600000000002, 4809.15, 11342.859999999993, 0.4219596942321056, 138.9879256428075, 2.0947628018589297], "isController": false}, {"data": ["2.4 Patient attending session", 1301, 36, 2.7671022290545735, 2550.1929285165234, 185, 22868, 1192.0, 6960.599999999996, 10044.19999999999, 17618.740000000005, 0.3650454272518617, 122.67653346787544, 1.8546828834450075], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 10.080645161290322, 19.027217741935484], "isController": false}, {"data": ["1.1 Homepage", 1519, 0, 0.0, 1027.3370638578026, 29, 28608, 254.0, 2393.0, 4482.0, 12058.799999999996, 0.42225538862089834, 136.89413739986028, 2.089227014375725], "isController": false}, {"data": ["1.3 Sign-in", 1516, 1, 0.06596306068601583, 1160.637203166225, 88, 32617, 296.5, 2867.0999999999995, 5133.099999999989, 13965.2499999999, 0.42176144382629993, 136.29761098945553, 2.200352728349324], "isController": false}, {"data": ["Run some searches", 25, 0, 0.0, 15192.839999999998, 7162, 37133, 12787.0, 27198.000000000007, 34891.399999999994, 37133.0, 0.007429817939741204, 25.151777249600276, 0.25884556974815887], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 352, 0, 0.0, 5737.826704545457, 241, 57058, 3527.0, 13987.699999999999, 18698.149999999994, 22994.67999999999, 0.10227789135530992, 97.57884667249269, 1.7259578605099541], "isController": true}, {"data": ["2.1 Open session", 1481, 0, 0.0, 1615.5962187710995, 241, 27054, 750.0, 3718.3999999999983, 6179.899999999999, 14189.10000000001, 0.41299417430027324, 134.18038688731644, 1.720939412904102], "isController": false}, {"data": ["7.7 Partial name search", 25, 0, 0.0, 2301.68, 494, 15154, 983.0, 6803.200000000002, 12804.099999999995, 15154.0, 0.00744974846669277, 3.1687298488960067, 0.03217767527172213], "isController": false}, {"data": ["4.3 Vaccination confirm", 1428, 4, 0.2801120448179272, 3235.325630252096, 99, 32636, 1657.5, 8067.9000000000015, 11630.05, 19280.570000000003, 0.41190972946357407, 132.2057464490093, 2.4810342008028203], "isController": false}, {"data": ["4.1 Vaccination questions", 1447, 0, 0.0, 1468.9447131997235, 97, 33543, 314.0, 4182.200000000001, 7507.199999999993, 13731.359999999995, 0.4131259271779188, 129.7214290507968, 2.360466660102428], "isController": false}, {"data": ["7.7 Last name search", 25, 0, 0.0, 1865.3599999999997, 489, 7924, 1134.0, 5231.600000000002, 7320.399999999999, 7924.0, 0.007451047363923757, 3.279291806541453, 0.032192599403677774], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 36.0, 36, 36, 36.0, 36.0, 36.0, 36.0, 27.777777777777775, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1514, 2, 0.13210039630118892, 4856.806472919417, 512, 44543, 2873.5, 11903.0, 15564.75, 25917.699999999968, 0.42132646595312034, 571.0383637192552, 8.091832715860937], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 351, 1, 0.2849002849002849, 5999.353276353277, 515, 38651, 3846.0, 14367.600000000004, 18672.399999999998, 34285.96000000005, 0.10148738289194514, 95.04023131714142, 1.709560532977183], "isController": true}, {"data": ["7.0 Open Children Search", 26, 0, 0.0, 1458.8461538461538, 255, 11526, 870.5, 2852.8, 8609.449999999988, 11526.0, 0.007453538653478108, 3.1063367020341857, 0.031000326611913737], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.503018465909092, 14.026988636363637], "isController": false}, {"data": ["7.5 year group", 26, 0, 0.0, 2681.4999999999995, 1607, 10772, 1834.5, 5753.700000000003, 10078.649999999998, 10772.0, 0.007466668504615837, 3.37285884306269, 0.03289243598121501], "isController": false}, {"data": ["7.2 No Consent search", 26, 0, 0.0, 3451.7692307692305, 2157, 16895, 2537.0, 5741.500000000001, 13232.599999999984, 16895.0, 0.007454878630275007, 3.5330510588042263, 0.03278953771939206], "isController": false}, {"data": ["1.4 Open Sessions list", 1485, 1, 0.06734006734006734, 1677.138047138046, 307, 28949, 614.0, 3909.6000000000017, 6880.8, 14125.960000000196, 0.41350665898871586, 158.99672499810998, 1.718716454794394], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 142.578125, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1446, 1, 0.06915629322268327, 1207.601659751037, 91, 21745, 276.0, 3136.399999999999, 6217.499999999991, 14145.489999999994, 0.4139129717920886, 130.67758140288447, 2.1528596227645553], "isController": false}, {"data": ["2.2 Session register", 1479, 0, 0.0, 820.1507775524022, 72, 21529, 197.0, 1848.0, 3949.0, 10221.000000000036, 0.41325581596788064, 140.19913091196463, 1.7256590660998348], "isController": false}, {"data": ["7.3 Due vaccination", 26, 0, 0.0, 686.4999999999999, 336, 2130, 504.0, 1241.8, 1835.2999999999988, 2130.0, 0.0074652964210794705, 3.0848727979887918, 0.0326020688166816], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 10, 21.73913043478261, 0.05620503597122302], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 35, 76.08695652173913, 0.19671762589928057], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 1, 2.1739130434782608, 0.005620503597122302], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 17792, 46, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 35, "502/Bad Gateway", 10, "Test failed: text expected to contain /Vaccination outcome recorded for/", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 1477, 2, "502/Bad Gateway", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.2 Sign-in page", 1518, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.4 Patient attending session", 1301, 36, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 35, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.3 Sign-in", 1516, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 1428, 4, "502/Bad Gateway", 3, "Test failed: text expected to contain /Vaccination outcome recorded for/", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 1485, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1446, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
