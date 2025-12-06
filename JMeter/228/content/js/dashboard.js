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

    var data = {"OkPercent": 99.99365763937338, "KoPercent": 0.00634236062662523};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8015997174000807, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.3586128048780488, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.993140243902439, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9935213414634146, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4624624624624625, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.44375, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9743589743589743, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.7062893081761006, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9761396011396012, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.967948717948718, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.44696969696969696, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7286585365853658, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.4817073170731707, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9897103658536586, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4893162393162393, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.44832826747720367, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.045454545454545456, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.21428571428571427, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.9670767004341534, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9904725609756098, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9900914634146342, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8809523809523809, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 15767, 1, 0.00634236062662523, 328.54106678505786, 2, 9782, 132.0, 664.2000000000007, 889.5999999999985, 4674.199999999997, 4.343054775872812, 1787.919244536974, 20.961557854929108], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 21, 0, 0.0, 110.99999999999999, 78, 364, 94.0, 161.20000000000005, 344.59999999999974, 364.0, 0.006239921412646895, 2.5918342326991493, 0.02730255792949899], "isController": false}, {"data": ["2.0 Register attendance", 1312, 1, 0.07621951219512195, 1328.3932926829243, 540, 3623, 1280.0, 1847.1000000000001, 2186.7499999999977, 3003.2199999999993, 0.4480709044884957, 849.9135743381477, 8.916116332628441], "isController": true}, {"data": ["2.5 Select patient", 1312, 0, 0.0, 116.6288109756099, 67, 1148, 88.0, 176.10000000000014, 260.6999999999998, 531.4799999999996, 0.4486968809752864, 182.78492414923718, 1.8643520256595107], "isController": false}, {"data": ["7.1 Full name search", 21, 0, 0.0, 7089.047619047619, 6308, 8557, 7101.0, 7930.4, 8496.3, 8557.0, 0.0062240147384669, 3.046634085709277, 0.02697159883898415], "isController": false}, {"data": ["2.3 Search by first/last name", 1312, 0, 0.0, 110.62347560975613, 68, 1519, 86.0, 159.0, 222.69999999999982, 556.359999999997, 0.4487843656114875, 185.3321711009421, 1.9382720589744389], "isController": false}, {"data": ["4.0 Vaccination for flu", 333, 0, 0.0, 1014.5975975975973, 682, 3734, 912.0, 1403.0000000000002, 1614.8000000000002, 2532.2600000000016, 0.1138662799544398, 136.30066929244416, 1.9257356770410359], "isController": true}, {"data": ["4.0 Vaccination for hpv", 320, 0, 0.0, 1089.2906249999999, 721, 2875, 968.0, 1563.8000000000006, 1892.55, 2608.030000000001, 0.1128684891635669, 134.8743866440821, 1.911459966472768], "isController": true}, {"data": ["7.6 First name search", 21, 0, 0.0, 5575.5714285714275, 4893, 6627, 5542.0, 6205.0, 6587.499999999999, 6627.0, 0.0062345490803001015, 3.034917260111622, 0.02696187343152847], "isController": false}, {"data": ["1.2 Sign-in page", 1404, 0, 0.0, 214.594017094017, 14, 6478, 104.0, 247.0, 382.5, 4923.950000000002, 0.3991378168298564, 161.18087435710456, 1.978087493322828], "isController": false}, {"data": ["2.4 Patient attending session", 795, 1, 0.12578616352201258, 615.2528301886782, 410, 2918, 520.0, 880.8, 1079.3999999999999, 1696.7999999999975, 0.2720043849159712, 112.69493400333232, 1.3870953956158367], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 10.44921875, 19.661458333333336], "isController": false}, {"data": ["1.1 Homepage", 1404, 0, 0.0, 217.98005698005662, 29, 6926, 111.0, 239.5, 366.0, 4826.550000000001, 0.3996865136831425, 161.37996329241267, 1.9726706895738184], "isController": false}, {"data": ["1.3 Sign-in", 1404, 0, 0.0, 238.0470085470087, 78, 6619, 112.0, 335.0, 500.5, 4921.150000000003, 0.39853088571786227, 161.21001466433637, 2.078470616525719], "isController": false}, {"data": ["Run some searches", 21, 0, 0.0, 27523.04761904762, 23764, 32767, 26961.0, 30362.0, 32532.299999999996, 32767.0, 0.006225616336017266, 24.264928821842872, 0.21689544725865362], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 330, 0, 0.0, 1081.3939393939386, 719, 4182, 966.5, 1541.8000000000002, 1720.5499999999997, 2619.6999999999994, 0.11627530044832937, 139.7282136698264, 1.9699317908827478], "isController": true}, {"data": ["2.1 Open session", 1312, 0, 0.0, 600.9801829268288, 229, 3084, 512.0, 974.0, 1158.7999999999993, 1822.4699999999912, 0.44838114584622035, 181.86832822920292, 1.8666318882211776], "isController": false}, {"data": ["7.7 Partial name search", 21, 0, 0.0, 5148.428571428572, 3002, 6642, 4936.0, 6037.2, 6583.599999999999, 6642.0, 0.00623259325740254, 2.973466366552462, 0.02694732878101754], "isController": false}, {"data": ["4.3 Vaccination confirm", 1312, 0, 0.0, 771.3925304878057, 491, 3511, 654.5, 1156.3000000000004, 1400.0999999999995, 2234.589999999983, 0.4479060052861102, 181.22914189620425, 2.700014851608945], "isController": false}, {"data": ["4.1 Vaccination questions", 1312, 0, 0.0, 150.02134146341456, 85, 1336, 113.0, 233.0, 346.0, 648.0499999999984, 0.4486913567749488, 177.42202357878207, 2.560968786240291], "isController": false}, {"data": ["7.7 Last name search", 21, 0, 0.0, 5732.999999999999, 4955, 9782, 5380.0, 6541.2, 9459.799999999996, 9782.0, 0.006234004953362221, 3.0515654277558975, 0.026976624392444266], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 28.0, 28, 28, 28.0, 28.0, 28.0, 28.0, 35.714285714285715, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1404, 0, 0.0, 969.1951566951575, 420, 18629, 677.0, 1111.5, 1424.0, 14931.300000000003, 0.3984015132447221, 663.5030570363979, 7.647444595427378], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 329, 0, 0.0, 1061.5379939209718, 702, 2957, 964.0, 1520.0, 1729.0, 2437.199999999998, 0.11500886686902168, 137.84419220461425, 1.9486427074765202], "isController": true}, {"data": ["7.0 Open Children Search", 22, 0, 0.0, 4812.545454545455, 867, 7214, 5004.5, 5852.8, 7011.799999999997, 7214.0, 0.0062341931324695204, 2.9011047982034186, 0.02589619847049739], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 46.0, 46, 46, 46.0, 46.0, 46.0, 46.0, 21.73913043478261, 6.241508152173913, 13.41711956521739], "isController": false}, {"data": ["7.5 year group", 21, 0, 0.0, 1608.952380952381, 1392, 2338, 1586.0, 1967.2, 2301.6999999999994, 2338.0, 0.0062397360056835076, 3.137764589412743, 0.027454083992640675], "isController": false}, {"data": ["7.2 No Consent search", 21, 0, 0.0, 1823.8571428571427, 1602, 3321, 1721.0, 2217.8, 3216.1999999999985, 3321.0, 0.006233527532452189, 3.353497801586967, 0.027384155456458958], "isController": false}, {"data": ["1.4 Open Sessions list", 1382, 0, 0.0, 303.3270622286549, 194, 1866, 247.0, 439.10000000000014, 565.0999999999995, 1115.8500000000004, 0.45067828386144543, 207.55068853020913, 1.8719501205205693], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1312, 0, 0.0, 139.9733231707317, 81, 1160, 102.0, 225.70000000000005, 329.6999999999998, 594.3499999999995, 0.4486348949725878, 178.57796840949524, 2.3317501866604977], "isController": false}, {"data": ["2.2 Session register", 1312, 0, 0.0, 127.35060975609763, 66, 1133, 87.0, 258.10000000000014, 343.6999999999998, 577.8699999999999, 0.4486571404536225, 188.36114320914928, 1.8717241424561653], "isController": false}, {"data": ["7.3 Due vaccination", 21, 0, 0.0, 433.19047619047626, 341, 854, 384.0, 653.2, 836.7999999999997, 854.0, 0.006240236629773001, 3.1108348601793265, 0.027218621415838373], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, 100.0, 0.00634236062662523], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 15767, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 795, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
