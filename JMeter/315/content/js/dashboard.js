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

    var data = {"OkPercent": 99.99052312357847, "KoPercent": 0.009476876421531463};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7619011261691162, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9615384615384616, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.3687796208530806, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9410714285714286, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4807692307692308, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9549763033175356, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.31467661691542287, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.325, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.34615384615384615, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9064310544611819, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.7113486842105263, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9461181923522596, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9104347826086957, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.3225419664268585, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.855457227138643, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.46153846153846156, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.539901780233272, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9095295536791315, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3269230769230769, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.3269565217391304, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.3341404358353511, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5555555555555556, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.6325088339222615, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9101089588377724, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9471040189125296, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9615384615384616, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21104, 2, 0.009476876421531463, 397.4895754359354, 0, 13255, 154.0, 892.9000000000015, 1405.9000000000015, 3348.950000000008, 5.634157775639636, 2352.4223625038007, 42.798433137108475], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 26, 0, 0.0, 177.6153846153846, 82, 1684, 101.0, 236.00000000000003, 1186.999999999998, 1684.0, 0.0076627471714884494, 3.4776216998058374, 0.057070542992579805], "isController": false}, {"data": ["2.0 Register attendance", 1688, 2, 0.11848341232227488, 1492.5924170616106, 404, 14235, 1053.0, 2994.500000000002, 3985.2, 6728.269999999994, 0.4724638654709524, 934.7553311812856, 15.273809400418024], "isController": true}, {"data": ["2.5 Select patient", 1680, 0, 0.0, 255.7773809523809, 58, 7958, 109.5, 427.0, 961.9999999999964, 3019.610000000001, 0.47316559612950543, 212.66498487146302, 3.4192928171385364], "isController": false}, {"data": ["7.1 Full name search", 26, 0, 0.0, 1211.307692307692, 273, 6600, 673.5, 3368.900000000002, 6163.199999999998, 6600.0, 0.007664285432138943, 3.532454301513873, 0.05667466175076451], "isController": false}, {"data": ["2.3 Search by first/last name", 1688, 0, 0.0, 216.45556872037872, 66, 4194, 112.0, 382.0, 673.55, 2642.0399999999936, 0.4726752804829353, 214.1026623805326, 3.5415936023589802], "isController": false}, {"data": ["4.0 Vaccination for flu", 402, 0, 0.0, 1698.8930348258693, 420, 13838, 1150.5, 3242.199999999998, 4403.9, 8372.529999999972, 0.11494588107733457, 151.36644278445462, 3.2620079464739637], "isController": true}, {"data": ["4.0 Vaccination for hpv", 420, 0, 0.0, 1714.8952380952392, 239, 13722, 1107.5, 3575.200000000001, 4325.65, 9000.630000000054, 0.12079979820681327, 159.31756015659175, 3.446932978959695], "isController": true}, {"data": ["7.6 First name search", 26, 0, 0.0, 2292.4615384615386, 505, 12662, 1159.0, 7676.600000000001, 11245.899999999994, 12662.0, 0.007663018185815811, 4.2501210333196875, 0.05660427229105676], "isController": false}, {"data": ["1.2 Sign-in page", 1726, 0, 0.0, 328.00753186558524, 15, 10293, 118.0, 675.5999999999999, 1457.8499999999933, 3516.3300000000004, 0.4798755326312582, 213.87722988729666, 4.080757894730989], "isController": false}, {"data": ["2.4 Patient attending session", 608, 2, 0.32894736842105265, 791.3240131578943, 247, 12863, 486.0, 1370.5, 2179.3499999999995, 7151.3899999999485, 0.1710014214493158, 77.85841178545031, 1.5031594371514934], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.775862068965516, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 1726, 0, 0.0, 243.45596755504076, 27, 6645, 117.0, 451.29999999999995, 799.4999999999986, 2605.46, 0.4799427850362404, 213.6454674803657, 4.072683121217253], "isController": false}, {"data": ["1.3 Sign-in", 1725, 0, 0.0, 328.36695652173864, 62, 9617, 124.0, 654.8000000000002, 1361.4999999999973, 3145.2000000000003, 0.48100101749142776, 214.53395201450195, 4.253157551656721], "isController": false}, {"data": ["Run some searches", 26, 0, 0.0, 9639.5, 4016, 23937, 7202.5, 22327.2, 23862.1, 23937.0, 0.007630012478005021, 30.8484843493771, 0.4530385823136017], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 417, 0, 0.0, 1619.5923261390883, 222, 9091, 1138.0, 3186.7999999999997, 4114.0, 7058.299999999996, 0.1201630067377732, 158.0810239437938, 3.417477413515053], "isController": true}, {"data": ["2.1 Open session", 1695, 0, 0.0, 488.9758112094395, 114, 9814, 311.0, 878.0000000000005, 1335.9999999999982, 3287.6799999999985, 0.47316036228172165, 211.73481533835152, 3.4228960044294228], "isController": false}, {"data": ["7.7 Partial name search", 26, 0, 0.0, 1366.0384615384614, 307, 6133, 917.5, 3618.0000000000014, 5730.499999999998, 6133.0, 0.007701768563039568, 4.263556346157321, 0.0568815413193959], "isController": false}, {"data": ["4.3 Vaccination confirm", 1629, 0, 0.0, 991.9846531614504, 341, 13255, 664.0, 2070.0, 2792.5, 4903.100000000001, 0.4716968839338999, 210.16153513293006, 4.871590832217071], "isController": false}, {"data": ["4.1 Vaccination questions", 1658, 0, 0.0, 341.03679131483693, 82, 9134, 145.0, 702.4000000000019, 1357.4499999999996, 3017.650000000005, 0.4726102681279388, 207.17980559689352, 4.4397748912112736], "isController": false}, {"data": ["7.7 Last name search", 26, 0, 0.0, 2083.1923076923076, 400, 6783, 1254.0, 5269.600000000001, 6560.049999999999, 6783.0, 0.007693602857995917, 4.277789120139603, 0.05685475417311376], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 21.0, 21, 21, 21.0, 21.0, 21.0, 21.0, 47.61904761904761, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1725, 0, 0.0, 1642.9918840579724, 597, 17407, 1227.0, 3148.600000000001, 4084.899999999997, 6633.040000000001, 0.4809645388330769, 882.7499076277978, 15.844911668771292], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 413, 0, 0.0, 1606.1937046004841, 287, 11781, 1126.0, 3315.8, 4236.099999999998, 6933.140000000025, 0.11912415765808251, 157.36684925670707, 3.3939250280540274], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 1108.2592592592594, 290, 5849, 724.0, 2603.6, 4586.999999999993, 5849.0, 0.007637722996759626, 4.18876508627091, 0.05519144385849279], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.358506944444445, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 26, 0, 0.0, 2193.538461538462, 1704, 3756, 2065.5, 3069.7, 3522.899999999999, 3756.0, 0.007658738399588785, 4.259851052266471, 0.057226229098640134], "isController": false}, {"data": ["7.2 No Consent search", 26, 0, 0.0, 132.80769230769232, 81, 424, 101.5, 268.4000000000001, 408.24999999999994, 424.0, 0.007664728276538679, 3.4791996340571294, 0.057220029401602875], "isController": false}, {"data": ["Debug Sampler", 1688, 0, 0.0, 0.26421800947867313, 0, 4, 0.0, 1.0, 1.0, 1.0, 0.47270744589838076, 2.6592665335240033, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1698, 0, 0.0, 756.4458186101299, 334, 4882, 615.5, 1142.0, 1460.6499999999985, 3450.06, 0.4734733621042294, 239.7877004035956, 3.4210906071480256], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 47.526041666666664, 102.37630208333333], "isController": false}, {"data": ["4.2 Vaccination batch", 1652, 0, 0.0, 340.8753026634379, 82, 11226, 144.0, 670.1000000000001, 1260.9999999999982, 3062.550000000002, 0.4716016986796294, 207.6761378238479, 4.189529165688921], "isController": false}, {"data": ["2.2 Session register", 1692, 0, 0.0, 248.68144208037805, 65, 8858, 114.0, 411.5000000000002, 765.3499999999999, 2878.889999999992, 0.4728434969068155, 218.00515921780382, 3.4247555757002317], "isController": false}, {"data": ["7.3 Due vaccination", 26, 0, 0.0, 182.53846153846155, 84, 631, 117.5, 493.20000000000005, 603.3499999999999, 631.0, 0.007663614484820885, 3.4789194414109303, 0.05697107519774336], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, 100.0, 0.009476876421531463], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21104, 2, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 608, 2, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
