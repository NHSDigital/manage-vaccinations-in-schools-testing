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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.37059630928778403, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.7082738944365192, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8642857142857143, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.6904761904761905, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.29225352112676056, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.7044967880085653, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.00363901018922853, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3225806451612903, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9193548387096774, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.17475035663338087, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.5967741935483871, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5928571428571429, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.006521739130434782, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.3034375, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5161290322580645, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.5046153846153846, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.609375, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.5, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0031645569620253164, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [0.7088698140200286, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.421875, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.5161290322580645, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9294871794871795, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.5579531442663379, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.46774193548387094, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.26885474860335196, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10683, 0, 0.0, 1551.3032855939382, 105, 21339, 932.0, 3735.2000000000007, 5028.799999999996, 8711.239999999998, 2.9669799543468907, 106.16537567260781, 4.066046752465054], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 4, 0, 0.0, 12584.5, 9804, 15261, 12636.5, 15261.0, 15261.0, 15261.0, 0.002026553936226374, 0.4183235790120448, 0.031162224882637195], "isController": true}, {"data": ["2.0 Register attendance", 709, 0, 0.0, 11541.02256699577, 6232, 46322, 10216.0, 17420.0, 20482.5, 30400.09999999999, 0.20242117422553202, 71.912095567169, 0.878873573362544], "isController": true}, {"data": ["2.5 Select patient", 701, 0, 0.0, 840.7475035663339, 356, 12675, 506.0, 1004.6000000000008, 3114.8999999999996, 6585.560000000007, 0.2008144875191361, 5.084537028877324, 0.1392366075572135], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 531.8571428571429, 425, 3141, 457.0, 587.9, 632.3500000000001, 3141.0, 0.07866432471734222, 1.130261923404547, 0.11369453181803368], "isController": false}, {"data": ["2.5 Select menacwy", 483, 0, 0.0, 771.194616977226, 361, 9489, 554.0, 914.4000000000004, 2239.9999999999955, 5348.759999999998, 0.14226481461245208, 3.2046176944219527, 0.09919636487626053], "isController": false}, {"data": ["2.3 Search by first/last name", 710, 0, 0.0, 1952.0591549295787, 872, 15484, 1409.0, 3709.199999999999, 5554.799999999994, 9932.549999999992, 0.20228260247109567, 23.653468896895276, 0.17446039780298303], "isController": false}, {"data": ["2.5 Select td_ipv", 467, 0, 0.0, 826.5995717344754, 359, 8894, 513.0, 1003.9999999999998, 3094.9999999999936, 6748.839999999995, 0.14245248889206127, 3.25484580347398, 0.09918810994144502], "isController": false}, {"data": ["4.0 Vaccination for hpv", 687, 0, 0.0, 4091.5167394468745, 1007, 23309, 2776.0, 7967.4000000000015, 9962.000000000004, 13434.160000000002, 0.19955377800034335, 9.966621773571964, 1.174687749260678], "isController": true}, {"data": ["5.8 Consent confirm", 31, 0, 0.0, 1748.7096774193546, 1006, 8292, 1371.0, 2667.0000000000005, 6007.199999999994, 8292.0, 0.01043801268319554, 0.844108840883103, 0.022854525943343813], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 133.42857142857142, 105, 1554, 109.5, 125.8, 142.35000000000002, 1554.0, 0.0789427090205578, 0.4757377513338498, 0.04756606588445719], "isController": false}, {"data": ["5.9 Patient home page", 31, 0, 0.0, 444.09677419354847, 368, 670, 422.0, 584.2, 633.3999999999999, 670.0, 0.010422834210700619, 0.23183910972689148, 0.007775426441015668], "isController": false}, {"data": ["2.4 Patient attending session", 701, 0, 0.0, 2432.5192582025693, 1072, 20674, 1666.0, 4711.000000000004, 6880.7, 11031.380000000003, 0.2008369255734453, 19.75898161049297, 0.2985095710183435], "isController": false}, {"data": ["5.4 Consent route", 31, 0, 0.0, 960.290322580645, 459, 5137, 667.0, 2116.0000000000005, 4105.599999999998, 5137.0, 0.010452632714717306, 0.1188423904201621, 0.016435302945113563], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 335.44285714285706, 309, 636, 322.0, 362.6, 399.85, 636.0, 0.07891867881112392, 0.4073097827312402, 0.04277330736345095], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 628.8285714285712, 492, 2809, 522.0, 743.6999999999999, 1178.1000000000008, 2809.0, 0.07861405664255088, 0.7628787898994414, 0.12367895044057563], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 460, 0, 0.0, 4007.523913043475, 972, 34088, 2854.5, 7108.600000000004, 9124.999999999996, 14599.539999999997, 0.14190435646374344, 7.753703563920201, 0.8344981757770806], "isController": true}, {"data": ["2.1 Open session", 719, 0, 0.0, 4400.194714881783, 2331, 18101, 3840.0, 6407.0, 8005.0, 12997.799999999987, 0.203141545864784, 3.4393990772351786, 0.13288314881191862], "isController": false}, {"data": ["4.3 Vaccination confirm", 1600, 0, 0.0, 2006.7837499999982, 923, 21142, 1375.0, 4017.600000000003, 5547.5999999999985, 11127.800000000001, 0.4693959695315076, 9.535405816010423, 1.092762927660067], "isController": false}, {"data": ["5.6 Consent questions", 31, 0, 0.0, 1030.2903225806451, 460, 4127, 670.0, 3053.6000000000013, 3901.3999999999996, 4127.0, 0.010452104075983425, 0.12552402761715628, 0.020445874959118787], "isController": false}, {"data": ["4.1 Vaccination questions", 1625, 0, 0.0, 1109.9600000000016, 458, 21339, 690.0, 2328.0000000000045, 4064.499999999999, 6887.8600000000015, 0.4707945157219294, 5.460177748559948, 0.929871510489157], "isController": false}, {"data": ["5.3 Consent parent details", 32, 0, 0.0, 650.9375000000002, 459, 2182, 568.0, 823.4, 1529.3999999999978, 2182.0, 0.01046653260782818, 0.11831704738133896, 0.019117520435904915], "isController": false}, {"data": ["5.2 Consent who", 32, 0, 0.0, 1111.9062499999998, 484, 5077, 558.5, 3339.7, 4032.4499999999966, 5077.0, 0.01044917066238599, 0.20701143841324118, 0.016548453110489532], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2033.9, 1720, 4639, 1855.5, 2723.2999999999997, 3299.600000000001, 4639.0, 0.07878890202037256, 3.775711914007541, 0.3750936497551916], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 474, 0, 0.0, 4009.7046413502107, 956, 24805, 2860.5, 6993.5, 8541.5, 15776.75, 0.14213737427289536, 7.3615593289908965, 0.8391134897214287], "isController": true}, {"data": ["5.0 Consent for td_ipv", 4, 0, 0.0, 9697.25, 8590, 11356, 9421.5, 11356.0, 11356.0, 11356.0, 0.0020266658560003244, 0.41905571779437956, 0.03136977911875502], "isController": true}, {"data": ["2.5 Select hpv", 699, 0, 0.0, 812.6280400572247, 350, 13878, 505.0, 1050.0, 2957.0, 5220.0, 0.20055012131991246, 4.060200214257248, 0.14943334235067696], "isController": false}, {"data": ["5.1 Consent start", 32, 0, 0.0, 1214.0625000000002, 585, 4727, 824.0, 2932.2, 4568.4, 4727.0, 0.010456146106343581, 0.12358629892373582, 0.022407577266835295], "isController": false}, {"data": ["5.5 Consent agree", 31, 0, 0.0, 907.0645161290323, 476, 4222, 620.0, 1814.0, 3123.9999999999973, 4222.0, 0.010456990734431565, 0.1691272649293782, 0.01624812912629481], "isController": false}, {"data": ["1.5 Open Sessions list", 78, 0, 0.0, 473.7051282051283, 322, 5979, 362.5, 536.1000000000001, 640.449999999999, 5979.0, 0.022013116430759438, 0.27873248793088556, 0.013273133104284034], "isController": false}, {"data": ["4.2 Vaccination batch", 1622, 0, 0.0, 953.9512946979039, 450, 14902, 585.0, 1782.2000000000035, 3619.3999999999996, 5726.439999999999, 0.4707891581494561, 9.495137959527371, 0.7612222542426897], "isController": false}, {"data": ["5.0 Consent for hpv", 23, 0, 0.0, 8427.826086956522, 6067, 18034, 7256.0, 11526.2, 16818.199999999983, 18034.0, 0.007733049743346803, 1.5466112620269938, 0.11696861581687736], "isController": true}, {"data": ["5.7 Consent triage", 31, 0, 0.0, 1053.6451612903227, 489, 4077, 815.0, 2734.400000000001, 3631.199999999999, 4077.0, 0.010456429911730868, 0.1680888237039171, 0.0170539549464479], "isController": false}, {"data": ["2.2 Session register", 716, 0, 0.0, 1959.7499999999984, 808, 14729, 1469.5, 3695.2000000000003, 4847.099999999999, 9826.63000000001, 0.20268191196981059, 20.05193383419261, 0.13435958831935083], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10683, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
