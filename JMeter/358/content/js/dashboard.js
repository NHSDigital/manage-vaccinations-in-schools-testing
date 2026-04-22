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

    var data = {"OkPercent": 99.93415808989154, "KoPercent": 0.06584191010846588};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7297872917684085, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4898085237801112, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9959627329192546, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5660377358490566, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9984605911330049, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5036764705882353, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5074074074074074, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.724153989444272, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.43823529411764706, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.4969512195121951, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.9295819935691318, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.722394540942928, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7246737103791174, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.4212698412698413, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5025773195876289, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9794226044226044, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.7826923076923077, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9959093769666457, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.3124223602484472, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5038860103626943, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.44539141414141414, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.4562841530054645, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.39487179487179486, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8449969306322898, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9955891619407687, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9969268592501537, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9917127071823204, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.4494047619047619, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 28857, 19, 0.06584191010846588, 641.9374848390297, 0, 60000, 198.0, 1927.9000000000015, 2948.9500000000007, 6082.970000000005, 7.56501516699423, 404.62680715929054, 59.13677139917914], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1619, 11, 0.679431747992588, 962.2532427424337, 302, 2078, 926.0, 1250.0, 1376.0, 1647.0, 0.45303884409335565, 71.4809064104192, 16.988632011223835], "isController": true}, {"data": ["2.5 Select patient", 1610, 0, 0.0, 112.73105590062103, 58, 913, 90.0, 177.9000000000001, 236.89999999999964, 463.3699999999958, 0.4536886720701645, 11.835333821958617, 3.2718335493931705], "isController": false}, {"data": ["7.1 Full name search", 159, 0, 0.0, 1780.5094339622642, 182, 12882, 566.0, 5465.0, 8752.0, 12083.400000000007, 0.04876558658559924, 1.8906899177494774, 0.3598792225554026], "isController": false}, {"data": ["2.3 Search by first/last name", 1624, 1, 0.06157635467980296, 100.93596059113325, 0, 1095, 86.0, 144.5, 183.75, 297.75, 0.4547645123504689, 14.280416126505461, 3.3986078901152843], "isController": false}, {"data": ["4.0 Vaccination for flu", 408, 0, 0.0, 776.7058823529406, 190, 2274, 718.5, 1035.4, 1152.3999999999996, 1603.0099999999966, 0.11690226197281163, 6.123999725025394, 3.3113818132099557], "isController": true}, {"data": ["4.0 Vaccination for hpv", 405, 0, 0.0, 763.2246913580248, 164, 1469, 718.0, 1013.0000000000002, 1112.8999999999999, 1313.82, 0.11612943184320634, 5.667556743654028, 3.2979840181528943], "isController": true}, {"data": ["1.2 Sign-in page", 3221, 0, 0.0, 943.3511331884506, 13, 12150, 202.0, 2748.6000000000004, 5554.799999999999, 6389.0, 0.896162803929539, 61.58068420072071, 7.77658886573361], "isController": false}, {"data": ["7.2 First name search", 170, 0, 0.0, 1468.411764705882, 297, 7613, 760.0, 3441.4, 4331.599999999999, 6748.92999999999, 0.050116210648456595, 6.756551902263956, 0.369463395506669], "isController": false}, {"data": ["7.7 Due vaccination search", 164, 0, 0.0, 695.3048780487804, 570, 2481, 657.5, 817.5, 923.25, 1580.7499999999923, 0.04937184859339905, 6.612496193626154, 0.3739790526385189], "isController": false}, {"data": ["2.4 Patient attending session", 1555, 11, 0.707395498392283, 387.96720257234693, 21, 1119, 349.0, 533.4000000000001, 645.9999999999991, 910.7600000000002, 0.436709552199991, 14.17848408039219, 3.828675856529959], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 10.44921875, 19.661458333333336], "isController": false}, {"data": ["1.1 Homepage", 3224, 0, 0.0, 944.6408188585611, 30, 9447, 208.5, 2717.5, 5592.75, 6356.5, 0.89577352711382, 71.96761655796314, 7.7601188185826615], "isController": false}, {"data": ["1.3 Sign-in", 3218, 0, 0.0, 950.9711000621501, 61, 13764, 239.0, 2701.2, 5528.049999999999, 6335.049999999999, 0.8960421279023565, 61.80353033776444, 8.026897859707452], "isController": false}, {"data": ["Run some searches", 1575, 1, 0.06349206349206349, 1931.1161904761886, 0, 60000, 917.0, 5603.000000000001, 5985.199999999998, 8142.560000000003, 0.4410440338363382, 52.22526967873722, 3.2970073372750535], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 388, 1, 0.25773195876288657, 773.0824742268037, 67, 1664, 724.0, 1037.1, 1110.6499999999999, 1436.4300000000003, 0.112474787384967, 5.574700371007363, 3.1924201582104277], "isController": true}, {"data": ["2.1 Open session", 1628, 0, 0.0, 255.4717444717444, 91, 1018, 225.0, 395.10000000000014, 476.54999999999995, 670.9700000000003, 0.4547760423533934, 10.15366888232642, 3.2825760118313005], "isController": false}, {"data": ["4.3 Vaccination confirm", 1560, 2, 0.1282051282051282, 519.6160256410252, 23, 1721, 473.0, 703.9000000000001, 801.5999999999985, 1056.2899999999986, 0.45201524914008445, 9.634906334780025, 4.657322130460149], "isController": false}, {"data": ["4.1 Vaccination questions", 1589, 2, 0.12586532410320955, 137.22466960352423, 24, 853, 112.0, 216.0, 279.0, 443.0999999999999, 0.45324967753381973, 6.3285141103199445, 4.248874773446472], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 35.0, 35, 35, 35.0, 35.0, 35.0, 35.0, 28.57142857142857, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3220, 0, 0.0, 3069.294720496899, 335, 28452, 970.0, 8162.200000000003, 16853.5, 18682.43, 0.8959172328288559, 232.78292316716758, 26.8246025797582], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 386, 1, 0.25906735751295334, 765.6450777202075, 86, 1680, 729.5, 1009.3, 1090.1999999999998, 1408.2799999999993, 0.11127969632751056, 5.901173298541371, 3.1556168377171576], "isController": true}, {"data": ["7.0 Open Children Search", 1584, 0, 0.0, 1777.070075757575, 75, 12575, 872.5, 5519.5, 5885.5, 7113.350000000033, 0.4409399369656318, 50.95435337369159, 3.180163379868642], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 51.0, 51, 51, 51.0, 51.0, 51.0, 51.0, 19.607843137254903, 5.629595588235294, 12.101715686274511], "isController": false}, {"data": ["7.8 Year group search", 193, 0, 0.0, 2482.3005181347157, 2160, 5436, 2403.0, 2808.4, 2983.2999999999997, 3588.9000000000046, 0.055729706879067115, 7.691134937646255, 0.4243135672022301], "isController": false}, {"data": ["7.9 DOB search", 183, 0, 0.0, 1128.9180327868855, 804, 3300, 1036.0, 1482.6, 1757.5999999999997, 3006.839999999999, 0.05388810003515978, 7.3972764764676855, 0.4060331109798918], "isController": false}, {"data": ["7.4 Partial name search", 195, 0, 0.0, 1960.9282051282044, 241, 12439, 943.0, 4776.6, 6174.599999999999, 9515.799999999976, 0.0569172230933314, 7.672644337973158, 0.41961116761888695], "isController": false}, {"data": ["Debug Sampler", 1624, 0, 0.0, 0.5701970443349749, 0, 26, 1.0, 1.0, 1.0, 1.0, 0.45477826619146444, 2.620985136553195, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1629, 0, 0.0, 454.23388581952156, 321, 1478, 399.0, 616.0, 693.0, 835.0, 0.45449878465518356, 37.55322119692422, 3.2772391755213484], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1587, 2, 0.1260239445494644, 121.72652804032762, 20, 587, 101.0, 177.20000000000005, 249.5999999999999, 447.83999999999924, 0.45447737536022415, 7.282978629808705, 4.028484369948163], "isController": false}, {"data": ["7.5 Needs Consent search", 160, 1, 0.625, 6531.299999999998, 5180, 60000, 5840.0, 6271.5, 6517.999999999999, 57867.43999999995, 0.04573784723959228, 6.2379908001536215, 0.34522359839940403], "isController": false}, {"data": ["2.2 Session register", 1627, 0, 0.0, 120.6429010448678, 63, 717, 91.0, 226.20000000000005, 289.5999999999999, 444.44000000000005, 0.4552242084149048, 18.731462416250775, 3.2898102965203746], "isController": false}, {"data": ["7.6 Needs triage search", 181, 0, 0.0, 232.4033149171271, 165, 1352, 205.0, 323.20000000000005, 358.0, 758.3200000000049, 0.050756496130448116, 3.575210263079192, 0.38494359368892045], "isController": false}, {"data": ["7.3 Last name search", 168, 0, 0.0, 1426.2916666666665, 325, 7421, 708.5, 3915.899999999999, 4627.099999999996, 6670.970000000002, 0.050969528413540056, 6.928755004608495, 0.375791537529956], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 2, 10.526315789473685, 0.006930727379838514], "isController": false}, {"data": ["504/Gateway Time-out", 1, 5.2631578947368425, 0.003465363689919257], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: https://performance.mavistesting.com/sessions/7QMcV79wRq/patients?q=&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;+&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;&amp;registration_status=&amp;programme_status_group=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Bvaccine_criteria%5D%5B%5D=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0", 1, 5.2631578947368425, 0.003465363689919257], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 2, 10.526315789473685, 0.006930727379838514], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, 57.89473684210526, 0.03811900058911183], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 2, 10.526315789473685, 0.006930727379838514], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 28857, 19, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, "Test failed: text expected to contain /Check and confirm/", 2, "Test failed: text expected to contain /Which batch did you use?/", 2, "Test failed: text expected to contain /Vaccination outcome recorded for/", 2, "504/Gateway Time-out", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 1624, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: https://performance.mavistesting.com/sessions/7QMcV79wRq/patients?q=&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;+&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;&amp;registration_status=&amp;programme_status_group=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Bvaccine_criteria%5D%5B%5D=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Bprogramme_statuses%5D%5B%5D=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1555, 11, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 1560, 2, "Test failed: text expected to contain /Vaccination outcome recorded for/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 1589, 2, "Test failed: text expected to contain /Which batch did you use?/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1587, 2, "Test failed: text expected to contain /Check and confirm/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.5 Needs Consent search", 160, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
