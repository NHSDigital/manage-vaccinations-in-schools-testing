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

    var data = {"OkPercent": 99.98192662208567, "KoPercent": 0.018073377914332188};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2597546556310967, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.42214532871972316, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.45930232558139533, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.0, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4420731707317073, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9571428571428572, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.5, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.5, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9071428571428571, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.19285714285714287, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0031645569620253164, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.019253910950661854, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.375, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.4313953488372093, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.375, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.4528301886792453, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.4270833333333333, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.25, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.2323943661971831, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.43633177570093457, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.005, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5533, 1, 0.018073377914332188, 2037.5693114043002, 0, 19003, 1151.0, 4754.800000000001, 6399.4000000000015, 10282.259999999998, 3.070622088167311, 113.0218867193028, 4.0850631264168955], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 1, 0, 0.0, 11348.0, 11348, 11348, 11348.0, 11348.0, 11348.0, 11348.0, 0.08812125484666901, 19.961443508768063, 1.412865978586535], "isController": true}, {"data": ["2.0 Register attendance", 299, 1, 0.33444816053511706, 19152.73913043478, 7949, 40044, 17219.0, 28354.0, 33187.0, 37939.0, 0.17430773885552686, 78.62472685623896, 0.7321151615596637], "isController": true}, {"data": ["2.5 Select patient", 289, 0, 0.0, 1172.5051903114177, 594, 7519, 926.0, 2071.0, 3118.5, 5048.500000000014, 0.1706964414812435, 4.021304671220344, 0.11835397798015905], "isController": false}, {"data": ["2.5 Select menacwy", 172, 0, 0.0, 1020.7965116279067, 605, 5370, 852.5, 1298.7, 2490.099999999998, 4919.5900000000065, 0.12018567288953609, 3.108135192199251, 0.08380133832336795], "isController": false}, {"data": ["2.3 Search by first/last name", 299, 0, 0.0, 3957.391304347827, 1824, 14360, 2872.0, 7151.0, 9177.0, 12358.0, 0.17524436038445917, 23.70385109738722, 0.13678659812160318], "isController": false}, {"data": ["2.5 Select td_ipv", 164, 0, 0.0, 1084.4756097560978, 599, 4959, 795.5, 2064.0, 2889.5, 4916.75, 0.12301636117603641, 3.2207804145763888, 0.08565494679542379], "isController": false}, {"data": ["4.0 Vaccination for flu", 275, 0, 0.0, 4751.912727272728, 1501, 17710, 3948.0, 8187.4000000000015, 9416.399999999992, 14833.520000000022, 0.16971170609635305, 8.267422594105142, 1.0122989880553817], "isController": true}, {"data": ["5.8 Consent confirm", 4, 0, 0.0, 2922.5, 2040, 4490, 2580.0, 4490.0, 4490.0, 4490.0, 0.006340892734288061, 0.6352271045224832, 0.01402396173826063], "isController": false}, {"data": ["4.0 Vaccination for hpv", 252, 0, 0.0, 5007.603174603174, 1560, 18631, 4134.0, 8350.400000000001, 9045.3, 14339.89, 0.16597718077220222, 7.750969296238641, 0.9959267617045198], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 273.7571428571429, 103, 4437, 116.0, 189.8, 1438.6000000000067, 4437.0, 0.236562410233014, 1.4205295512918, 0.14253809288454067], "isController": false}, {"data": ["Get correct patient name", 299, 0, 0.0, 0.6688963210702337, 0, 93, 0.0, 1.0, 1.0, 1.0, 0.17562078128340614, 0.0, 0.0], "isController": false}, {"data": ["5.9 Patient home page", 4, 0, 0.0, 690.5, 658, 716, 694.0, 716.0, 716.0, 716.0, 0.0063192251366137485, 0.1692228631737676, 0.004719362717993519], "isController": false}, {"data": ["2.4 Patient attending session", 291, 1, 0.3436426116838488, 4681.487972508594, 2401, 15226, 3647.0, 8185.6, 10111.799999999992, 13483.559999999992, 0.17075220158852358, 23.224117050487497, 0.25340185071035265], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 183.0, 183, 183, 183.0, 183.0, 183.0, 183.0, 5.46448087431694, 26.185749658469945, 3.991632513661202], "isController": false}, {"data": ["5.4 Consent route", 4, 0, 0.0, 768.5, 722, 798, 777.0, 798.0, 798.0, 798.0, 0.006346073604934706, 0.07740319610081373, 0.010118702810993302], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 563.5571428571429, 309, 4120, 359.5, 792.6999999999998, 2937.150000000002, 4120.0, 0.23651285447364062, 1.323686688465268, 0.12818811936803767], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 2462.8, 1040, 7976, 1843.0, 4736.599999999999, 6318.450000000004, 7976.0, 0.22943898889515293, 3.540620021993366, 0.5074993260229701], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 158, 0, 0.0, 5169.645569620251, 1476, 14389, 4071.0, 8587.199999999997, 12016.4, 14187.81, 0.12311902570772011, 6.2403186221032945, 0.732968061960429], "isController": true}, {"data": ["2.1 Open session", 301, 0, 0.0, 5957.046511627908, 2979, 16715, 5359.0, 8908.6, 10927.999999999998, 14211.800000000008, 0.17252536438102084, 3.120609285898315, 0.11164857962475447], "isController": false}, {"data": ["4.3 Vaccination confirm", 831, 0, 0.0, 2583.265944645007, 1405, 14413, 2002.0, 4574.0, 5891.4, 8569.919999999995, 0.5242035701354097, 11.363974505870324, 1.2200159480735677], "isController": false}, {"data": ["5.6 Consent questions", 4, 0, 0.0, 2024.5, 746, 5477, 937.5, 5477.0, 5477.0, 5477.0, 0.006294494205918083, 0.07934658675150595, 0.01575313967403962], "isController": false}, {"data": ["4.1 Vaccination questions", 860, 0, 0.0, 1190.132558139532, 687, 10286, 915.0, 1841.6, 3122.8999999999996, 5826.909999999998, 0.5235978232942583, 6.540177623521902, 1.1035425825823357], "isController": false}, {"data": ["5.3 Consent parent details", 4, 0, 0.0, 923.0, 755, 1286, 825.5, 1286.0, 1286.0, 1286.0, 0.006368727002924838, 0.07460242226570649, 0.011740785546651722], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 4, 0, 0.0, 1120.5, 785, 1652, 1022.5, 1652.0, 1652.0, 1652.0, 0.006387959973042809, 0.0982367184330973, 0.010191728130819032], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 5262.771428571429, 2268, 11705, 4665.0, 9446.8, 10146.000000000002, 11705.0, 0.23370648468721725, 11.968784638639693, 0.924099176268108], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 171, 0, 0.0, 4489.730994152047, 1524, 13433, 3815.0, 7244.8000000000075, 8749.800000000001, 12800.84, 0.12309933900694109, 6.200795977153194, 0.740866746675238], "isController": true}, {"data": ["5.0 Consent for td_ipv", 1, 0, 0.0, 14715.0, 14715, 14715, 14715.0, 14715.0, 14715.0, 14715.0, 0.06795786612300374, 15.417144495412844, 1.089383176180768], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 265, 0, 0.0, 1037.226415094339, 599, 7986, 745.0, 1461.6000000000001, 2655.2999999999997, 6323.959999999989, 0.16934000213432304, 4.175109703565534, 0.1261781461215708], "isController": false}, {"data": ["2.5 Select flu", 288, 0, 0.0, 1149.0312500000005, 590, 6994, 919.0, 1855.1000000000004, 2940.2000000000007, 6351.800000000003, 0.172300019802537, 4.1756913771991435, 0.11946583404277468], "isController": false}, {"data": ["5.1 Consent start", 4, 0, 0.0, 2579.5, 854, 5892, 1786.0, 5892.0, 5892.0, 5892.0, 0.006352675111489448, 0.08247465927824082, 0.013763095444179045], "isController": false}, {"data": ["5.5 Consent agree", 4, 0, 0.0, 868.75, 725, 1136, 807.0, 1136.0, 1136.0, 1136.0, 0.006301395759160654, 0.1095467499566779, 0.009930544342134284], "isController": false}, {"data": ["1.5 Open Sessions list", 71, 0, 0.0, 1955.9718309859154, 730, 5852, 1672.0, 3628.5999999999995, 4370.599999999997, 5852.0, 0.04455287736287126, 1.0772746518600511, 0.026659783913838497], "isController": false}, {"data": ["4.2 Vaccination batch", 856, 0, 0.0, 1152.9672897196285, 678, 9168, 841.5, 1782.5000000000005, 2642.249999999998, 6023.539999999991, 0.5253280538682187, 8.025786867281942, 0.8493825573442212], "isController": false}, {"data": ["5.0 Consent for hpv", 1, 0, 0.0, 8481.0, 8481, 8481, 8481.0, 8481.0, 8481.0, 8481.0, 0.11791062374719961, 26.38123544540738, 1.8891032160122627], "isController": true}, {"data": ["5.7 Consent triage", 4, 0, 0.0, 875.25, 725, 1106, 835.0, 1106.0, 1106.0, 1106.0, 0.00634973045394223, 0.10692691847184213, 0.010721371049673942], "isController": false}, {"data": ["5.0 Consent for flu", 1, 0, 0.0, 16548.0, 16548, 16548, 16548.0, 16548.0, 16548.0, 16548.0, 0.06043026347594876, 13.72469246661228, 0.9437507553782936], "isController": true}, {"data": ["2.2 Session register", 300, 0, 0.0, 3528.8366666666698, 1266, 19003, 2766.5, 5924.200000000002, 7799.149999999996, 12950.810000000016, 0.1737836879679126, 24.77732754376597, 0.11398331799692286], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, 100.0, 0.018073377914332188], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5533, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 291, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
