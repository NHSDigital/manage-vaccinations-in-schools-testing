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

    var data = {"OkPercent": 99.94548366213499, "KoPercent": 0.05451633786500392};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7219810943948874, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.46722325293753864, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9937965260545906, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.865979381443299, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9978434996919285, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.49014778325123154, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.48284313725490197, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7468468468468469, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.49731182795698925, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.5152284263959391, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.8767303889255109, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7475990396158463, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7490985576923077, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.4979166666666667, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.49609375, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9560270602706027, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.6079182630906769, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9949463044851548, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.31525983778912586, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4882198952879581, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5197873597164796, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.2864321608040201, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.45808383233532934, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.3770053475935829, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.6567484662576687, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9933544303797468, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9938423645320197, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9946524064171123, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.46348314606741575, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 29349, 16, 0.05451633786500392, 545.0994582438884, 0, 60006, 228.0, 1349.0, 2625.5500000000065, 4148.970000000005, 7.818983433580469, 424.62495823961115, 61.183944936679396], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1617, 4, 0.24737167594310452, 1118.4718614718613, 425, 3886, 1075.0, 1454.0, 1591.2999999999997, 2063.64, 0.45287001118311665, 70.75209276243635, 16.912158223350616], "isController": true}, {"data": ["2.5 Select patient", 1612, 0, 0.0, 133.99069478908223, 58, 1845, 106.0, 220.0, 305.3499999999999, 545.189999999996, 0.4549822960517867, 11.512838350304616, 3.2811587107094424], "isController": false}, {"data": ["7.1 Full name search", 194, 0, 0.0, 538.5979381443296, 185, 4494, 317.5, 1107.0, 2114.25, 3972.450000000006, 0.05483441701969856, 2.281228617845522, 0.40464810940328283], "isController": false}, {"data": ["2.3 Search by first/last name", 1623, 0, 0.0, 119.87122612446099, 61, 858, 101.0, 180.60000000000014, 233.0, 407.76, 0.4547987998691928, 14.274794170617083, 3.401072158222065], "isController": false}, {"data": ["4.0 Vaccination for flu", 406, 2, 0.49261083743842365, 915.9999999999997, 213, 3009, 867.0, 1181.6, 1330.25, 2049.04, 0.11664082469085153, 6.155443564981724, 3.3133028954827823], "isController": true}, {"data": ["4.0 Vaccination for hpv", 408, 5, 1.2254901960784315, 904.3137254901961, 221, 2073, 855.0, 1190.2, 1367.7499999999998, 1832.0999999999997, 0.11689810868601655, 5.731391503924969, 3.317969848382007], "isController": true}, {"data": ["1.2 Sign-in page", 3330, 0, 0.0, 732.0330330330338, 12, 9048, 226.0, 1882.4000000000015, 3697.45, 4733.7400000000025, 0.9260479776280157, 64.49122692944738, 8.042902340210839], "isController": false}, {"data": ["7.7 Due vaccination search", 186, 0, 0.0, 719.833333333333, 529, 3172, 665.0, 934.3000000000002, 1026.0000000000002, 1503.3399999999913, 0.05425698558689431, 7.263093896125584, 0.4110232154629492], "isController": false}, {"data": ["7.2 First name search", 197, 0, 0.0, 1173.8477157360398, 252, 8952, 667.0, 2742.000000000005, 4831.5, 5723.880000000034, 0.058995265704794284, 7.993317763755255, 0.43493567120291343], "isController": false}, {"data": ["2.4 Patient attending session", 1517, 4, 0.26367831245880025, 451.2643375082399, 120, 3085, 413.0, 616.0, 733.3999999999996, 1004.0, 0.4266151616272458, 13.908898955077591, 3.7429188070074], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 16.49876644736842, 31.044407894736842], "isController": false}, {"data": ["1.1 Homepage", 3332, 0, 0.0, 733.599939975991, 28, 8973, 235.0, 1883.2000000000044, 3677.7, 4646.34, 0.9263007130180279, 74.94079867573679, 8.032031255646904], "isController": false}, {"data": ["1.3 Sign-in", 3328, 0, 0.0, 744.4002403846141, 50, 9612, 267.0, 1915.199999999999, 3666.5499999999997, 4802.980000000001, 0.925663749305335, 64.71632216658722, 8.295616840988881], "isController": false}, {"data": ["Run some searches", 1680, 1, 0.05952380952380952, 1380.3404761904778, 0, 60006, 829.5, 3672.9, 4019.749999999999, 5257.310000000003, 0.4702190409042984, 55.13852646603731, 3.5148999040459272], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 384, 2, 0.5208333333333334, 903.7265624999995, 221, 1702, 851.0, 1203.5, 1297.25, 1502.6499999999978, 0.11143370782604153, 5.57961607650693, 3.1738208276927273], "isController": true}, {"data": ["2.1 Open session", 1626, 0, 0.0, 302.5147601476015, 108, 2046, 261.0, 487.0, 572.6499999999999, 769.2200000000003, 0.4541099040923234, 10.393620762129636, 3.278039322887502], "isController": false}, {"data": ["4.3 Vaccination confirm", 1566, 5, 0.31928480204342274, 616.2943805874836, 78, 2389, 573.0, 849.3, 984.2499999999993, 1356.819999999996, 0.45263372999964446, 9.686902187830858, 4.6530757266744045], "isController": false}, {"data": ["4.1 Vaccination questions", 1583, 0, 0.0, 152.84586228679683, 71, 949, 123.0, 254.0, 321.5999999999999, 503.32000000000016, 0.45177366111039285, 6.334005845642239, 4.235830684906564], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 21.0, 21, 21, 21.0, 21.0, 21.0, 21.0, 47.61904761904761, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3329, 0, 0.0, 2474.9396215079587, 332, 27144, 1095.0, 5473.0, 11159.5, 14116.099999999951, 0.9259635277736209, 241.57109913612666, 27.636192817093136], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 382, 2, 0.5235602094240838, 905.8429319371736, 251, 1929, 876.0, 1162.4, 1282.55, 1776.19, 0.11053656532219094, 5.911485159670359, 3.145482586512224], "isController": true}, {"data": ["7.0 Open Children Search", 1693, 0, 0.0, 1294.8198464264615, 86, 8986, 786.0, 3632.6000000000004, 3921.3, 5120.66, 0.4718201052774737, 54.00170297569249, 3.40289832760953], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 46.0, 46, 46, 46.0, 46.0, 46.0, 46.0, 21.73913043478261, 6.241508152173913, 13.41711956521739], "isController": false}, {"data": ["7.8 Year group search", 199, 0, 0.0, 1566.2814070351765, 1311, 5115, 1481.0, 1721.0, 2201.0, 3058.0, 0.05755405670780962, 7.948929629663505, 0.43821306746781524], "isController": false}, {"data": ["7.9 DOB search", 167, 0, 0.0, 1091.2095808383235, 675, 3257, 993.0, 1451.6000000000001, 1810.9999999999993, 3210.7599999999993, 0.049239209978989305, 6.765222648669243, 0.3709923162139116], "isController": false}, {"data": ["7.4 Partial name search", 187, 0, 0.0, 1763.2887700534764, 227, 8895, 949.0, 4557.6, 5108.2, 8829.880000000001, 0.053299556046050814, 7.203330008227228, 0.39289077668640365], "isController": false}, {"data": ["Debug Sampler", 1623, 0, 0.0, 0.29390018484288377, 0, 14, 0.0, 1.0, 1.0, 1.0, 0.45483384972715574, 2.617569144536137, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1630, 0, 0.0, 540.2601226993875, 322, 1751, 529.5, 692.0, 756.4499999999998, 895.3800000000001, 0.45435996012782287, 37.50247590681398, 3.2762387781103866], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1580, 6, 0.379746835443038, 143.78227848101287, 69, 1201, 117.0, 233.0, 292.9499999999998, 453.0400000000009, 0.45133430703473076, 7.261702928527641, 4.001471741723371], "isController": false}, {"data": ["7.5 Needs Consent search", 183, 1, 0.546448087431694, 4127.4098360655735, 3389, 60006, 3726.0, 4253.4, 4379.999999999999, 13896.719999999812, 0.05213407859426012, 7.123377687362187, 0.39378294658322366], "isController": false}, {"data": ["2.2 Session register", 1624, 0, 0.0, 138.66687192118204, 58, 1196, 100.0, 272.0, 343.0, 521.0, 0.4538837101863075, 18.312326203972656, 3.280392919812387], "isController": false}, {"data": ["7.6 Needs triage search", 187, 0, 0.0, 215.5614973262032, 130, 792, 187.0, 316.20000000000005, 362.79999999999995, 731.2800000000003, 0.053098556315562165, 3.5278409843939933, 0.40271581368710413], "isController": false}, {"data": ["7.3 Last name search", 178, 0, 0.0, 1292.4887640449426, 300, 5608, 803.5, 3191.499999999999, 4137.549999999999, 5558.2300000000005, 0.05213298597534813, 7.089854990488659, 0.3844473075179866], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 6, 37.5, 0.02044362669937647], "isController": false}, {"data": ["504/Gateway Time-out", 1, 6.25, 0.003407271116562745], "isController": false}, {"data": ["422/Unprocessable Entity", 5, 31.25, 0.017036355582813724], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, 25.0, 0.01362908446625098], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 29349, 16, "Test failed: text expected to contain /Check and confirm/", 6, "422/Unprocessable Entity", 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "504/Gateway Time-out", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1517, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 1566, 5, "422/Unprocessable Entity", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1580, 6, "Test failed: text expected to contain /Check and confirm/", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.5 Needs Consent search", 183, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
