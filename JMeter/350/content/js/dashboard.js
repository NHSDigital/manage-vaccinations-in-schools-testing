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

    var data = {"OkPercent": 99.96650414976367, "KoPercent": 0.03349585023633183};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7617827118544773, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5309653916211293, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.997872340425532, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8461538461538461, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9972776769509982, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4963680387409201, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.49767441860465117, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7648506151142355, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.494949494949495, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.17692307692307693, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.951586655817738, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7671929824561403, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7640944326990838, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.40885640584694755, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5063775510204082, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9812914906457453, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8266708307307933, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9950738916256158, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.3439041578576462, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4974160206718346, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.45225916453537934, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.3769230769230769, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.44966442953020136, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.13414634146341464, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8337356668678334, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.998766954377312, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9969806763285024, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9886363636363636, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.15948275862068967, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 26869, 9, 0.03349585023633183, 1167.003572890693, 0, 60003, 157.0, 1389.9000000000015, 1737.9000000000015, 30065.980000000003, 6.910498639195791, 328.8304037534991, 53.65941089077701], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1647, 6, 0.36429872495446264, 852.3928354584096, 358, 2115, 825.0, 1179.4, 1328.6, 1649.52, 0.4626850283608786, 69.3713325227859, 16.503057903033213], "isController": true}, {"data": ["2.5 Select patient", 1645, 0, 0.0, 113.21458966565359, 57, 1158, 89.0, 198.20000000000027, 282.6999999999998, 409.3199999999997, 0.46314636016231797, 11.561327308840914, 3.340024924999148], "isController": false}, {"data": ["7.1 Full name search", 143, 0, 0.0, 542.8671328671327, 187, 2860, 376.0, 1134.2, 1394.8, 2830.08, 0.04189188437019653, 1.604185503214543, 0.3091323081197897], "isController": false}, {"data": ["2.3 Search by first/last name", 1653, 0, 0.0, 106.02480338777995, 58, 771, 84.0, 170.0, 232.0, 406.0600000000004, 0.46255255134249373, 14.237930691288705, 3.4589501575141144], "isController": false}, {"data": ["4.0 Vaccination for flu", 413, 0, 0.0, 756.8958837772401, 188, 2534, 676.0, 1123.2, 1336.3, 1697.7800000000016, 0.11809332746965173, 6.187226171990493, 3.354272764651293], "isController": true}, {"data": ["4.0 Vaccination for hpv", 430, 0, 0.0, 754.879069767442, 189, 1678, 700.5, 1051.9, 1182.7499999999998, 1557.59, 0.12273300718701656, 5.987713386853011, 3.4925016242500444], "isController": true}, {"data": ["1.2 Sign-in page", 2845, 0, 0.0, 1974.7546572934984, 11, 34297, 142.0, 1696.4, 7168.899999999984, 30556.48, 0.7889777178271804, 46.81621475781088, 6.814773372043621], "isController": false}, {"data": ["7.7 Due vaccination search", 99, 0, 0.0, 718.838383838384, 510, 7338, 607.0, 851.0, 1092.0, 7338.0, 0.028427502546271504, 3.7838022118463432, 0.21521320994816143], "isController": false}, {"data": ["7.2 First name search", 130, 0, 0.0, 2105.9846153846147, 1244, 9773, 1563.5, 3525.2000000000016, 6259.95, 9479.119999999997, 0.039486577297405005, 5.327800597834374, 0.2911245203899573], "isController": false}, {"data": ["2.4 Patient attending session", 1229, 6, 0.4882017900732303, 344.48331977217225, 88, 1040, 306.0, 482.0, 591.0, 839.4000000000001, 0.34514638250644236, 11.097073980031357, 3.027028139575344], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 24.0, 24, 24, 24.0, 24.0, 24.0, 24.0, 41.666666666666664, 13.0615234375, 24.576822916666668], "isController": false}, {"data": ["1.1 Homepage", 2850, 1, 0.03508771929824561, 1968.3371929824557, 34, 35855, 131.5, 1656.6000000000004, 7613.249999999897, 30524.49999999999, 0.7878887401576109, 57.13441180615338, 6.792881151372225], "isController": false}, {"data": ["1.3 Sign-in", 2838, 0, 0.0, 1987.3770260747035, 57, 35013, 156.5, 1705.5999999999995, 7485.949999999957, 30537.02000000001, 0.7873906517474911, 47.02453478656456, 7.034839452627549], "isController": false}, {"data": ["Run some searches", 1163, 2, 0.17196904557179707, 4914.7755803955315, 0, 60003, 1371.0, 29686.8, 30134.0, 31420.279999999984, 0.32467269614292743, 37.560815716768715, 2.4254995201446428], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 392, 0, 0.0, 740.1862244897958, 174, 2334, 691.5, 1010.5, 1137.5999999999995, 1476.9099999999999, 0.11267880934141823, 5.578665510654902, 3.1970939125416975], "isController": true}, {"data": ["2.1 Open session", 1657, 0, 0.0, 254.00543150271562, 105, 1191, 223.0, 391.20000000000005, 467.0, 651.3600000000006, 0.46271500051102504, 10.583269115599304, 3.339433614464577], "isController": false}, {"data": ["4.3 Vaccination confirm", 1601, 0, 0.0, 496.2354778263593, 308, 2317, 427.0, 717.8, 868.8999999999999, 1193.92, 0.46210400774926197, 9.743864938359915, 4.762973327384093], "isController": false}, {"data": ["4.1 Vaccination questions", 1624, 0, 0.0, 139.78940886699502, 72, 1626, 110.0, 236.5, 316.5, 498.5, 0.46271563360557766, 6.480529758114263, 4.338464915420483], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 35.0, 35, 35, 35.0, 35.0, 35.0, 35.0, 28.57142857142857, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 2838, 1, 0.035236081747709654, 6183.044749823808, 255, 99238, 902.0, 5011.0999999999985, 21307.299999999956, 91292.88, 0.7876078589832254, 188.97940824247027, 23.945355234074672], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 387, 0, 0.0, 765.05684754522, 166, 2541, 707.0, 1050.0, 1205.6, 1613.0800000000002, 0.11095123048354955, 5.8945030608706555, 3.1539591200442145], "isController": true}, {"data": ["7.0 Open Children Search", 1173, 0, 0.0, 4578.241261722084, 81, 34785, 1321.0, 29706.800000000003, 30134.8, 31265.72, 0.32655238354008953, 36.74249319917427, 2.3550984478530923], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["7.8 Year group search", 130, 0, 0.0, 1499.4846153846152, 1284, 3062, 1410.0, 1883.9000000000003, 2168.199999999999, 2998.1399999999994, 0.03717987767820244, 5.114575635936783, 0.28299746542271376], "isController": false}, {"data": ["7.9 DOB search", 149, 0, 0.0, 1047.2751677852352, 661, 3181, 886.0, 1544.0, 2189.5, 3070.0, 0.04244391492416355, 5.816605333814982, 0.3198095689841804], "isController": false}, {"data": ["7.4 Partial name search", 123, 0, 0.0, 3162.8048780487816, 1251, 11272, 1752.0, 7129.4, 7497.6, 11149.840000000002, 0.03646922190394838, 4.933608006213555, 0.268804444860612], "isController": false}, {"data": ["Debug Sampler", 1653, 0, 0.0, 0.3551119177253478, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.46256666010920827, 2.6318917937512363, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1657, 0, 0.0, 465.0102595051297, 312, 1353, 395.0, 659.2, 750.1999999999998, 913.5200000000004, 0.46278956815896055, 38.19484620180544, 3.337038643557352], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.533203125, 153.564453125], "isController": false}, {"data": ["4.2 Vaccination batch", 1622, 0, 0.0, 124.6855733662145, 71, 557, 102.0, 203.0, 271.8499999999999, 420.30999999999995, 0.4627167808148836, 7.449407591204701, 4.10241476040856], "isController": false}, {"data": ["7.5 Needs Consent search", 140, 2, 1.4285714285714286, 30697.499999999985, 29374, 60003, 30016.5, 31243.3, 31896.149999999998, 60003.0, 0.04005516167979904, 5.4186813273028855, 0.3004455644988241], "isController": false}, {"data": ["2.2 Session register", 1656, 0, 0.0, 121.52294685990334, 58, 1186, 89.0, 225.0, 286.2999999999997, 465.0, 0.46282826639791325, 19.256271584154113, 3.3443170436683776], "isController": false}, {"data": ["7.6 Needs triage search", 132, 0, 0.0, 193.96969696969703, 127, 690, 162.0, 291.0, 354.04999999999995, 666.8999999999992, 0.042148635246349195, 2.7833465952524032, 0.3195710222864102], "isController": false}, {"data": ["7.3 Last name search", 116, 0, 0.0, 1983.2327586206893, 1298, 7937, 1617.5, 3211.7999999999997, 3618.5499999999993, 7396.739999999994, 0.03343808678797774, 4.541110013053105, 0.24657323567970696], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 2, 22.22222222222222, 0.007443522274740407], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, 66.66666666666667, 0.022330566824221222], "isController": false}, {"data": ["Assertion failed", 1, 11.11111111111111, 0.0037217611373702034], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 26869, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, "504/Gateway Time-out", 2, "Assertion failed", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1229, 6, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 2850, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 140, 2, "504/Gateway Time-out", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
