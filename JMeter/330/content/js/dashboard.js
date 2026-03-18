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

    var data = {"OkPercent": 99.96394014063345, "KoPercent": 0.03605985936654847};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4441592960909216, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0893854748603352, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9669479606188467, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.531055900621118, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9909217877094972, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.06818181818181818, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.08187134502923976, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.44881889763779526, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.01875, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.04294478527607362, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.5353658536585366, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.4436221158032216, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4349647266313933, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.16201859229747675, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.06725146198830409, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7261410788381742, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.43609022556390975, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9164244186046512, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.08798944126704795, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.05325443786982249, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.21508196721311476, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.03076923076923077, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.02023121387283237, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5606060606060606, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9810771470160117, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9443671766342142, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8486842105263158, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.011695906432748537, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 16639, 6, 0.03605985936654847, 3115.23499008353, 0, 60008, 609.0, 6199.0, 16953.0, 38758.79999999997, 8.400998082397336, 585.4096508194748, 66.02352152607445], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 716, 2, 0.27932960893854747, 1976.0488826815638, 483, 3958, 1990.5, 2607.3, 2713.6499999999996, 3114.7900000000004, 0.40404633215091473, 57.955895050446536, 13.776695679046133], "isController": true}, {"data": ["2.5 Select patient", 711, 0, 0.0, 355.58087201125164, 62, 2225, 349.0, 469.0, 531.3999999999999, 1074.8799999999992, 0.40415799564919086, 10.173231359349323, 2.9146489261107096], "isController": false}, {"data": ["7.1 Full name search", 161, 0, 0.0, 1067.3229813664595, 198, 10067, 758.0, 2229.2000000000016, 3478.1000000000004, 7259.0199999999795, 0.09474506222278978, 3.468377060852223, 0.6991517117078415], "isController": false}, {"data": ["2.3 Search by first/last name", 716, 0, 0.0, 259.6522346368715, 63, 1259, 255.0, 338.30000000000007, 387.04999999999984, 630.8600000000017, 0.4040488402500363, 11.632524029725523, 3.021500399534328], "isController": false}, {"data": ["4.0 Vaccination for flu", 176, 0, 0.0, 1930.079545454546, 520, 3129, 2003.0, 2389.0, 2487.6, 2904.929999999997, 0.1039053044838681, 5.448539592680875, 2.939305243970836], "isController": true}, {"data": ["4.0 Vaccination for hpv", 171, 0, 0.0, 1906.6549707602344, 531, 3534, 1997.0, 2431.2, 2607.4000000000005, 3075.3600000000006, 0.10014043084981161, 4.8239437389757684, 2.8042814892975647], "isController": true}, {"data": ["1.2 Sign-in page", 2286, 0, 0.0, 4269.474628171478, 13, 53603, 1348.0, 10485.80000000002, 24691.850000000013, 41178.970000000096, 1.2640924745024917, 103.84522129688229, 10.804592799338591], "isController": false}, {"data": ["7.2 First name search", 160, 0, 0.0, 4159.450000000001, 844, 16737, 3368.5, 8430.300000000008, 10981.099999999997, 16593.649999999998, 0.0941647848422946, 12.580589400009947, 0.6941888400825943], "isController": false}, {"data": ["7.7 Due vaccination search", 163, 0, 0.0, 2627.84662576687, 774, 5047, 2499.0, 3879.1999999999994, 4175.799999999998, 4856.279999999995, 0.09701757267985153, 12.740937124652106, 0.7336779558962876], "isController": false}, {"data": ["2.4 Patient attending session", 410, 2, 0.4878048780487805, 869.9902439024389, 265, 2197, 887.0, 1134.9, 1223.9, 1400.67, 0.23689754354581308, 7.113864407068561, 2.077657587784985], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 10.44921875, 19.661458333333336], "isController": false}, {"data": ["1.1 Homepage", 2297, 1, 0.043535045711798, 4289.535916412714, 26, 49270, 1408.0, 10030.20000000003, 24855.199999999997, 40201.45999999999, 1.2716356600519836, 136.79699729095793, 10.840769582296472], "isController": false}, {"data": ["1.3 Sign-in", 2268, 0, 0.0, 4301.9726631393305, 69, 54048, 1412.0, 10614.100000000015, 25561.64999999996, 40779.519999999946, 1.2607193104065486, 104.14274061679914, 11.311017908724867], "isController": false}, {"data": ["Run some searches", 1506, 3, 0.199203187250996, 6610.885790172642, 0, 60008, 3132.0, 20380.899999999972, 31651.099999999948, 43415.030000000006, 0.8486653807075706, 97.27915582149372, 6.304920142475477], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 171, 0, 0.0, 1932.602339181286, 445, 3280, 1987.0, 2386.8, 2473.6000000000004, 3038.8, 0.1031398546270891, 5.109168974747624, 2.9137456587771715], "isController": true}, {"data": ["2.1 Open session", 723, 0, 0.0, 559.499308437067, 134, 1977, 530.0, 828.6, 925.9999999999995, 1267.8799999999999, 0.40571070077404886, 9.35095016372924, 2.9265518609663657], "isController": false}, {"data": ["4.3 Vaccination confirm", 665, 0, 0.0, 1239.9954887218043, 370, 2603, 1262.0, 1586.6, 1681.6999999999998, 2022.7000000000003, 0.39804294554173947, 8.4366188997674, 4.102766752931751], "isController": false}, {"data": ["4.1 Vaccination questions", 688, 0, 0.0, 415.0944767441855, 79, 1373, 415.0, 557.4000000000001, 661.0, 824.3200000000002, 0.400533501309011, 5.651189817003345, 3.754215303094121], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 33.0, 33, 33, 33.0, 33.0, 33.0, 33.0, 30.303030303030305, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 2273, 1, 0.04399472063352398, 12976.738231412228, 317, 140251, 4457.0, 32340.600000000028, 72551.79999999983, 120358.0999999997, 1.2631293487798547, 376.97703030815796, 35.77302051762046], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 169, 0, 0.0, 1956.402366863905, 453, 2865, 2010.0, 2401.0, 2440.5, 2843.3, 0.10197991900742763, 5.412742602080994, 2.8869917768130247], "isController": true}, {"data": ["7.0 Open Children Search", 1525, 0, 0.0, 6064.840655737717, 82, 47999, 2755.0, 18594.600000000002, 30728.600000000002, 42956.44, 0.8457051212020215, 92.45756533747932, 6.097969340693833], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.8 Year group search", 172, 0, 0.0, 8938.569767441859, 1844, 29117, 8013.5, 13381.20000000001, 21088.249999999996, 28941.070000000003, 0.09822475880682045, 13.32759925037234, 0.7464965669875723], "isController": false}, {"data": ["7.9 DOB search", 195, 0, 0.0, 3172.2256410256405, 1230, 6444, 2883.0, 5151.800000000001, 5779.799999999999, 6386.4, 0.11442802418597664, 15.432240812823332, 0.8621516675243879], "isController": false}, {"data": ["7.4 Partial name search", 173, 0, 0.0, 5323.583815028902, 992, 44081, 3688.0, 10306.199999999997, 14701.699999999993, 40230.03999999995, 0.09842861279947474, 13.128169593353281, 0.7255254213939426], "isController": false}, {"data": ["Debug Sampler", 716, 0, 0.0, 0.33938547486033566, 0, 5, 0.0, 1.0, 1.0, 1.0, 0.4040711865076342, 2.2248280201993267, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 726, 0, 0.0, 707.4338842975206, 335, 1547, 680.0, 972.3000000000001, 1055.6, 1398.1100000000001, 0.4061138595584435, 33.56312288010383, 2.9272281704710474], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 687, 0, 0.0, 316.0625909752549, 89, 956, 316.0, 412.20000000000005, 474.6, 657.24, 0.4013722607949858, 6.49543279756904, 3.5573183332257363], "isController": false}, {"data": ["7.5 Needs Consent search", 151, 3, 1.9867549668874172, 31904.119205298, 16541, 60008, 30966.0, 43190.600000000006, 45855.80000000001, 60006.96, 0.09060302614107311, 12.028049197780705, 0.6752586864526274], "isController": false}, {"data": ["2.2 Session register", 719, 0, 0.0, 303.6940194714878, 59, 1012, 262.0, 531.0, 616.0, 810.3999999999999, 0.4039673073022569, 17.70758003532045, 2.917503561226049], "isController": false}, {"data": ["7.6 Needs triage search", 152, 0, 0.0, 448.34868421052647, 138, 1057, 420.0, 653.2000000000003, 784.5, 1054.88, 0.08799249748179365, 4.795161461891144, 0.6659616698964351], "isController": false}, {"data": ["7.3 Last name search", 171, 0, 0.0, 4255.169590643273, 1070, 21245, 3317.0, 6911.600000000003, 12919.400000000005, 17174.120000000006, 0.09861028695593504, 13.211835575347775, 0.7270430629609382], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 3, 50.0, 0.018029929683274236], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, 33.333333333333336, 0.012019953122182823], "isController": false}, {"data": ["Assertion failed", 1, 16.666666666666668, 0.006009976561091411], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 16639, 6, "504/Gateway Time-out", 3, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "Assertion failed", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 410, 2, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 2297, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 151, 3, "504/Gateway Time-out", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
