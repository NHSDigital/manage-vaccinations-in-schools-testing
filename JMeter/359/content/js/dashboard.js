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

    var data = {"OkPercent": 99.95807860262009, "KoPercent": 0.04192139737991266};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7225263446010675, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4898336414048059, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9978368355995055, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5751633986928104, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9990786240786241, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4987745098039216, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5097323600973236, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.711272040302267, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4845679012345679, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.3587570621468927, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.9272486772486772, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7119496855345911, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7101609340485958, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.3823915900131406, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5012853470437018, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9730722154222766, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.7581055308328035, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9981191222570532, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.30911097099621687, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5012987012987012, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.41034031413612565, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.4255952380952381, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.3163841807909605, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8536063569682152, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9971751412429378, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9957081545064378, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9783950617283951, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.4, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 28625, 12, 0.04192139737991266, 708.1578689956293, 0, 60007, 209.0, 2232.5000000000073, 3624.9000000000015, 6734.990000000002, 7.479049516663975, 396.09021056635214, 58.42465234422152], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1623, 9, 0.5545286506469501, 994.1540357362913, 341, 2496, 967.0, 1265.6000000000001, 1391.8, 1692.56, 0.45458084732973664, 71.17425509213524, 16.94733510293329], "isController": true}, {"data": ["2.5 Select patient", 1618, 0, 0.0, 113.87700865265772, 63, 729, 93.0, 184.0, 234.04999999999995, 367.0, 0.45566413329048927, 11.891888575580683, 3.2860796605034666], "isController": false}, {"data": ["7.1 Full name search", 153, 0, 0.0, 1533.4248366013076, 158, 13953, 614.0, 4882.0, 6759.299999999974, 11712.000000000033, 0.043546036271855916, 1.730330679669665, 0.3213268442564628], "isController": false}, {"data": ["2.3 Search by first/last name", 1628, 0, 0.0, 110.51781326781315, 66, 1068, 94.0, 164.0, 211.54999999999995, 324.3900000000003, 0.4558730052055769, 14.261191338377898, 3.409010288907417], "isController": false}, {"data": ["4.0 Vaccination for flu", 408, 0, 0.0, 809.5539215686277, 207, 2539, 765.0, 1041.7000000000003, 1196.099999999999, 1516.849999999999, 0.11650229278225464, 6.135595848281605, 3.3147653454114514], "isController": true}, {"data": ["4.0 Vaccination for hpv", 411, 0, 0.0, 781.5644768856447, 173, 1622, 751.0, 1012.6, 1161.0, 1375.6, 0.11804154430506991, 5.743939062129774, 3.3436653528501576], "isController": true}, {"data": ["1.2 Sign-in page", 3176, 0, 0.0, 1060.3315491183864, 12, 14052, 203.5, 3202.5000000000064, 6166.999999999993, 7028.130000000001, 0.8829742219345698, 60.040706065568614, 7.657994497883474], "isController": false}, {"data": ["7.7 Due vaccination search", 162, 0, 0.0, 788.3827160493828, 581, 7124, 689.0, 941.9000000000004, 1185.6999999999998, 3771.770000000024, 0.04546954887471286, 6.091232202671252, 0.3444165928839033], "isController": false}, {"data": ["7.2 First name search", 177, 1, 0.5649717514124294, 1825.6440677966098, 0, 7183, 839.0, 4604.800000000001, 5674.099999999999, 7001.259999999999, 0.052667740057029934, 7.080440555695986, 0.3860882888370279], "isController": false}, {"data": ["2.4 Patient attending session", 1512, 9, 0.5952380952380952, 394.9960317460322, 51, 1631, 359.0, 536.0, 618.3499999999999, 915.1499999999951, 0.4246954804199092, 13.756954373131073, 3.724037137909886], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 41.0, 41, 41, 41.0, 41.0, 41.0, 41.0, 24.390243902439025, 7.6457698170731705, 14.386432926829269], "isController": false}, {"data": ["1.1 Homepage", 3180, 0, 0.0, 1058.824213836476, 31, 13768, 213.0, 3205.8, 6149.699999999999, 7008.52, 0.8825329249999653, 70.37861299925207, 7.641092956665691], "isController": false}, {"data": ["1.3 Sign-in", 3169, 0, 0.0, 1069.9397286210194, 63, 13837, 243.0, 3150.0, 6148.5, 7060.300000000006, 0.8821295146506152, 60.19820090917239, 7.899633319686631], "isController": false}, {"data": ["Run some searches", 1522, 3, 0.19710906701708278, 2215.501971090666, 0, 60007, 1056.5, 6185.0, 6543.199999999999, 8235.32, 0.4258625605532072, 50.69234838150892, 3.1793761933665055], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 389, 0, 0.0, 802.1413881748076, 174, 1738, 776.0, 1025.0, 1124.5, 1534.4000000000005, 0.11212739978577613, 5.57580079302752, 3.1872047873283353], "isController": true}, {"data": ["2.1 Open session", 1634, 0, 0.0, 272.81028151774717, 111, 1568, 240.0, 426.5, 505.5, 685.3500000000017, 0.45612122217039447, 10.18146362319851, 3.2923093999842563], "isController": false}, {"data": ["4.3 Vaccination confirm", 1573, 0, 0.0, 539.1951684678955, 362, 2275, 492.0, 735.2000000000003, 844.7999999999997, 1134.3, 0.4547098312428148, 9.704110592321705, 4.686727015418941], "isController": false}, {"data": ["4.1 Vaccination questions", 1595, 0, 0.0, 140.70532915360513, 80, 631, 116.0, 220.4000000000001, 281.1999999999998, 425.03999999999996, 0.45451514490056805, 6.346666951569773, 4.261545052014913], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3172, 0, 0.0, 3423.6724464060494, 268, 41657, 975.0, 9450.700000000008, 18673.35, 20681.27, 0.8822990287200573, 228.1423204663508, 26.465742774021024], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 385, 0, 0.0, 806.5584415584412, 185, 1674, 763.0, 1062.4000000000003, 1190.5, 1463.0799999999997, 0.11121420491376133, 5.931530236777209, 3.1672913566450345], "isController": true}, {"data": ["7.0 Open Children Search", 1528, 0, 0.0, 2054.0968586387435, 72, 15294, 1008.5, 6203.3, 6573.5, 7739.390000000008, 0.425397097611373, 49.48216890505905, 3.06805454847773], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 53.0, 53, 53, 53.0, 53.0, 53.0, 53.0, 18.867924528301884, 5.417158018867925, 11.64504716981132], "isController": false}, {"data": ["7.8 Year group search", 189, 0, 0.0, 2690.068783068782, 2371, 4025, 2618.0, 2993.0, 3399.0, 3912.499999999999, 0.05514406606084053, 7.610311929412094, 0.4198483689537741], "isController": false}, {"data": ["7.9 DOB search", 168, 0, 0.0, 1272.1666666666667, 902, 3364, 1129.5, 1692.2999999999995, 2202.95, 3324.67, 0.04883647107660001, 6.706406107287767, 0.3679728396910861], "isController": false}, {"data": ["7.4 Partial name search", 177, 0, 0.0, 2312.333333333333, 295, 11627, 1511.0, 4865.8, 6761.999999999998, 10835.3, 0.05164562812463345, 6.988284523442884, 0.38068448173976904], "isController": false}, {"data": ["Debug Sampler", 1628, 0, 0.0, 0.5823095823095831, 0, 29, 1.0, 1.0, 1.0, 1.0, 0.45589113274944915, 2.6227935865911722, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1636, 0, 0.0, 454.1497555012228, 324, 2073, 405.0, 603.0, 663.0, 897.6699999999989, 0.4559121014844732, 37.641242878811816, 3.2874344704731424], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1593, 0, 0.0, 126.61958568738218, 72, 672, 105.0, 194.60000000000014, 251.29999999999995, 418.2999999999997, 0.45489214658549615, 7.296281719839266, 4.033023600617688], "isController": false}, {"data": ["7.5 Needs Consent search", 172, 1, 0.5813953488372093, 7232.470930232559, 5676, 60007, 6382.0, 6987.000000000001, 7236.45, 52690.2100000001, 0.05217439838671906, 7.118951796145374, 0.3939779089388395], "isController": false}, {"data": ["2.2 Session register", 1631, 0, 0.0, 128.45493562231755, 65, 956, 95.0, 231.79999999999995, 310.7999999999997, 493.4000000000003, 0.4562228829202292, 18.690506453903446, 3.2970482863739847], "isController": false}, {"data": ["7.6 Needs triage search", 162, 0, 0.0, 249.03086419753083, 163, 804, 215.0, 338.80000000000007, 443.54999999999984, 795.1800000000001, 0.04766023547686713, 3.3571143796005365, 0.361429198440157], "isController": false}, {"data": ["7.3 Last name search", 160, 1, 0.625, 1692.275, 0, 7774, 810.5, 4479.400000000001, 5314.0499999999965, 7405.559999999992, 0.04620303461531353, 6.240320768809111, 0.33855425894880586], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 1, 8.333333333333334, 0.0034934497816593887], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 48: https://performance.mavistesting.com/patients?q=&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0", 2, 16.666666666666668, 0.0069868995633187774], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, 75.0, 0.0314410480349345], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 28625, 12, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 48: https://performance.mavistesting.com/patients?q=&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0", 2, "504/Gateway Time-out", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.2 First name search", 177, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 48: https://performance.mavistesting.com/patients?q=&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.4 Patient attending session", 1512, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 172, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.3 Last name search", 160, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 48: https://performance.mavistesting.com/patients?q=&lt;script&gt;alert(&quot;fullname&quot;)&lt;/script&gt;&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
