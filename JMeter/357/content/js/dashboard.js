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

    var data = {"OkPercent": 99.95096665732699, "KoPercent": 0.04903334267301765};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6926218275502932, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.41174661746617464, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9916512059369202, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.640625, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9932639314145744, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4797619047619048, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.48166259168704156, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7299968622529024, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4427710843373494, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.4939759036144578, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.8008100147275405, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7308777429467085, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7321709079484763, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.4361910994764398, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4766233766233766, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9251679902260233, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5034832172260925, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9899937460913071, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.2957901350926799, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.47780678851174935, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.46026058631921823, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.45588235294117646, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.41420118343195267, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9921728240450846, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9923500611995104, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9736842105263158, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.436046511627907, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 28552, 14, 0.04903334267301765, 752.8382950406274, 0, 60007, 260.5, 1209.9000000000015, 2565.9500000000007, 10183.950000000008, 7.595220905691256, 399.12816358153486, 59.29630833903156], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1626, 11, 0.6765067650676507, 1230.8677736777367, 413, 3363, 1209.0, 1631.6, 1821.2999999999997, 2231.46, 0.4563503423469542, 68.98062988950554, 16.61467532565831], "isController": true}, {"data": ["2.5 Select patient", 1617, 0, 0.0, 150.8231292517006, 77, 962, 115.0, 263.0, 341.0, 574.299999999999, 0.4560452220872544, 11.894467027200687, 3.288818760733068], "isController": false}, {"data": ["7.1 Full name search", 160, 0, 0.0, 1032.5437500000003, 218, 11198, 573.0, 2319.3000000000015, 4707.799999999994, 11041.839999999997, 0.04745009140073856, 1.9061307584763658, 0.35014425661869464], "isController": false}, {"data": ["2.3 Search by first/last name", 1633, 1, 0.0612369871402327, 139.97121861604404, 0, 739, 110.0, 214.0, 296.0, 525.3000000000004, 0.4571916839828367, 14.234811290142858, 3.4168302765638727], "isController": false}, {"data": ["4.0 Vaccination for flu", 420, 0, 0.0, 1042.2761904761899, 236, 2101, 1000.0, 1386.2000000000003, 1527.8, 1848.9, 0.12038185123210825, 6.320006043545125, 3.4165980516985592], "isController": true}, {"data": ["4.0 Vaccination for hpv", 409, 0, 0.0, 1039.9364303178495, 304, 2372, 995.0, 1331.0, 1491.0, 1889.499999999999, 0.11756974990700779, 5.7506448213004475, 3.3450325325415244], "isController": true}, {"data": ["1.2 Sign-in page", 3187, 0, 0.0, 1070.700972701603, 13, 12882, 252.0, 2442.4000000000005, 6727.199999999972, 10410.559999999998, 0.8864044963820679, 59.616523311558666, 7.688161178973607], "isController": false}, {"data": ["7.2 First name search", 166, 0, 0.0, 1306.5602409638557, 356, 10541, 747.5, 2869.0, 3497.800000000002, 8461.990000000038, 0.047955742050107976, 6.476554374968402, 0.35356103207762474], "isController": false}, {"data": ["7.7 Due vaccination search", 166, 0, 0.0, 818.5481927710844, 638, 1638, 756.5, 1017.8000000000002, 1171.6, 1546.2100000000016, 0.051862034491377156, 6.944175821279055, 0.3928455142073856], "isController": false}, {"data": ["2.4 Patient attending session", 1358, 11, 0.8100147275405007, 516.4941089837997, 176, 2238, 466.0, 724.2000000000003, 849.1499999999999, 1155.6900000000007, 0.3814066772569277, 12.285138059983923, 3.3432632426301163], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 22.0, 22, 22, 22.0, 22.0, 22.0, 22.0, 45.45454545454545, 14.24893465909091, 26.811079545454547], "isController": false}, {"data": ["1.1 Homepage", 3190, 0, 0.0, 1069.5865203761757, 33, 14826, 251.0, 2449.6000000000004, 6347.349999999952, 10400.790000000005, 0.8861408952912029, 69.96864458413047, 7.672652905920588], "isController": false}, {"data": ["1.3 Sign-in", 3183, 0, 0.0, 1087.8146402764696, 74, 27556, 290.0, 2417.6, 6646.399999999973, 10400.48, 0.8801422163822588, 59.5011798244368, 7.882094971437547], "isController": false}, {"data": ["Run some searches", 1528, 2, 0.13089005235602094, 2213.5641361256558, 0, 60007, 921.5, 9126.000000000007, 9891.65, 10936.78, 0.4252104137592302, 50.02423201934596, 3.1792307201305685], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 385, 0, 0.0, 1051.472727272726, 245, 2709, 998.0, 1369.0000000000002, 1540.3999999999996, 1947.0199999999986, 0.111211699124114, 5.537145420634421, 3.1640202314301016], "isController": true}, {"data": ["2.1 Open session", 1637, 0, 0.0, 354.5491753207088, 136, 1317, 317.0, 546.0, 642.1999999999998, 934.4799999999996, 0.4570500032805972, 10.191080715079439, 3.299523842263305], "isController": false}, {"data": ["4.3 Vaccination confirm", 1579, 0, 0.0, 710.5737808739707, 478, 1851, 651.0, 960.0, 1077.0, 1389.8000000000002, 0.4560801199037235, 9.732351011330227, 4.700903807315826], "isController": false}, {"data": ["4.1 Vaccination questions", 1599, 0, 0.0, 174.175734834271, 87, 1676, 132.0, 303.0, 388.0, 588.0, 0.4562288505543794, 6.3745458375002135, 4.277582650910032], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 74.0, 74, 74, 74.0, 74.0, 74.0, 74.0, 13.513513513513514, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3183, 0, 0.0, 3560.7015394282175, 374, 47229, 1270.0, 7355.799999999999, 19697.799999999606, 31205.519999999997, 0.8798945342875523, 225.5835173386632, 26.397064411949593], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 383, 0, 0.0, 1046.8355091383814, 229, 2095, 1000.0, 1373.6, 1502.6, 1925.7599999999998, 0.11041501921019532, 5.88059302162664, 3.1415166445236022], "isController": true}, {"data": ["7.0 Open Children Search", 1535, 0, 0.0, 2019.2358306188937, 83, 32198, 880.0, 8653.400000000001, 9916.399999999998, 10635.919999999996, 0.4281730622519002, 49.137144873506244, 3.08807672000048], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 6.108710106382978, 13.131648936170214], "isController": false}, {"data": ["7.8 Year group search", 175, 0, 0.0, 2420.2228571428586, 2106, 3608, 2355.0, 2697.6, 2877.6, 3521.360000000001, 0.05416273084155885, 7.4748800024698205, 0.4123530806910174], "isController": false}, {"data": ["7.9 DOB search", 170, 0, 0.0, 1140.5823529411769, 803, 4609, 1007.5, 1462.5000000000002, 1637.0499999999993, 4077.919999999994, 0.05050628090167378, 6.931902044906471, 0.38060028079635333], "isController": false}, {"data": ["7.4 Partial name search", 169, 0, 0.0, 1445.1538461538453, 253, 9939, 814.0, 3003.0, 4693.5, 8697.20000000002, 0.05047384185679227, 6.835211845191501, 0.3720497535442941], "isController": false}, {"data": ["Debug Sampler", 1633, 0, 0.0, 0.31230863441518697, 0, 8, 0.0, 1.0, 1.0, 1.0, 0.45721382908042346, 2.615269872265012, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1639, 0, 0.0, 639.8560097620496, 497, 1534, 600.0, 800.0, 887.0, 1057.9999999999995, 0.457068980326234, 37.608653393894045, 3.295778201769602], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1597, 0, 0.0, 168.33750782717607, 90, 896, 133.0, 283.20000000000005, 371.0, 574.04, 0.45624986608195073, 7.317545864699916, 4.045063590985708], "isController": false}, {"data": ["7.5 Needs Consent search", 159, 2, 1.2578616352201257, 10895.056603773588, 8621, 60007, 9838.0, 10799.0, 12316.0, 60002.8, 0.04428456201175574, 6.001521818345701, 0.33261699993468724], "isController": false}, {"data": ["2.2 Session register", 1634, 0, 0.0, 155.07955936352485, 76, 1003, 112.0, 298.5, 367.75, 598.6000000000022, 0.45680623112773827, 17.88203720141954, 3.3017751680768765], "isController": false}, {"data": ["7.6 Needs triage search", 190, 0, 0.0, 260.9684210526316, 162, 1087, 217.0, 401.80000000000007, 538.3499999999992, 897.7200000000007, 0.055208596966491, 3.888809463472685, 0.41872383766289806], "isController": false}, {"data": ["7.3 Last name search", 172, 0, 0.0, 1283.627906976745, 430, 5062, 942.0, 2658.2000000000003, 3503.0499999999997, 4603.560000000007, 0.048863858472083965, 6.644567556095425, 0.360309643364146], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 2, 14.285714285714286, 0.0070047632390025216], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: https://performance.mavistesting.com/sessions/7QMcV79wRq/patients?q=&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;+&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;&amp;registration_status=&amp;programme_status_group=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Bvaccine_criteria%5D%5B%5D=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0", 1, 7.142857142857143, 0.0035023816195012608], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, 78.57142857142857, 0.03852619781451387], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 28552, 14, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, "504/Gateway Time-out", 2, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: https://performance.mavistesting.com/sessions/7QMcV79wRq/patients?q=&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;+&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;&amp;registration_status=&amp;programme_status_group=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Bvaccine_criteria%5D%5B%5D=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 1633, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: https://performance.mavistesting.com/sessions/7QMcV79wRq/patients?q=&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;+&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;&amp;registration_status=&amp;programme_status_group=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Bvaccine_criteria%5D%5B%5D=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1358, 11, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 159, 2, "504/Gateway Time-out", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
