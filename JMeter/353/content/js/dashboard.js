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

    var data = {"OkPercent": 99.97615722606356, "KoPercent": 0.023842773936441977};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7218028124086233, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4488984088127295, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9929317762753535, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8564102564102564, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9960293219303604, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4902676399026764, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.48936170212765956, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.746031746031746, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.49712643678160917, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.5372670807453416, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.8931750741839762, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7513456937799043, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7449071300179748, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.4991066110780226, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.47809278350515466, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.931139549055454, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.6773274224192527, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9875853507138423, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.31341719077568136, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.49870466321243523, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5198224852071006, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.2535885167464115, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.4543010752688172, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.4230769230769231, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.6449451887941535, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9919154228855721, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.984136668700427, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9879227053140096, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.43352601156069365, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 29359, 7, 0.023842773936441977, 538.8236997173008, 0, 60007, 232.5, 1186.0, 2076.5500000000065, 4103.94000000001, 7.813626939833555, 421.0418891956993, 61.116748149406774], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1634, 6, 0.3671970624235006, 1123.8935128518972, 417, 3284, 1091.5, 1519.0, 1712.0, 2318.6500000000074, 0.45893410447744426, 70.69871711337962, 16.67700229488117], "isController": true}, {"data": ["2.5 Select patient", 1627, 0, 0.0, 130.4074984634295, 71, 1291, 98.0, 220.20000000000005, 306.0, 563.2000000000003, 0.4589012600746032, 11.62515942640868, 3.3096429399331533], "isController": false}, {"data": ["7.1 Full name search", 195, 0, 0.0, 550.7538461538461, 169, 5774, 334.0, 1095.6, 2012.2, 3680.2399999999825, 0.05555373541892502, 2.2259186575795953, 0.4099820046850317], "isController": false}, {"data": ["2.3 Search by first/last name", 1637, 0, 0.0, 131.49664019547953, 73, 852, 103.0, 211.20000000000005, 270.0999999999999, 481.29999999999836, 0.4586947737937056, 14.079259513012977, 3.430349739266206], "isController": false}, {"data": ["4.0 Vaccination for flu", 411, 0, 0.0, 888.5352798053527, 187, 2511, 835.0, 1259.4, 1453.0, 1754.6399999999999, 0.11747673689069661, 6.1932928773118405, 3.325101014630284], "isController": true}, {"data": ["4.0 Vaccination for hpv", 423, 0, 0.0, 900.7966903073285, 184, 4144, 845.0, 1213.0, 1424.7999999999995, 1764.1599999999999, 0.12155078107152617, 5.962047683556047, 3.4441049236112247], "isController": true}, {"data": ["1.2 Sign-in page", 3339, 0, 0.0, 720.0886492961979, 12, 9396, 236.0, 1753.0, 3650.0, 4740.199999999998, 0.9291869906029391, 63.871873035930655, 8.07292344256823], "isController": false}, {"data": ["7.7 Due vaccination search", 174, 0, 0.0, 725.8275862068973, 563, 3993, 660.0, 903.0, 1039.5, 1917.75, 0.05091573708869083, 6.783536949188289, 0.3857057972760666], "isController": false}, {"data": ["7.2 First name search", 161, 0, 0.0, 1033.4037267080748, 305, 6213, 690.0, 1891.4000000000024, 3361.2000000000007, 6067.919999999999, 0.04725019978617083, 6.376342868194981, 0.3483598820087674], "isController": false}, {"data": ["2.4 Patient attending session", 1348, 6, 0.44510385756676557, 433.62166172106856, 154, 1612, 386.0, 612.3000000000004, 740.6499999999999, 1009.7299999999998, 0.37881800352233297, 12.141644039398479, 3.3227797327169206], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 21.0, 21, 21, 21.0, 21.0, 21.0, 21.0, 47.61904761904761, 14.88095238095238, 28.087797619047617], "isController": false}, {"data": ["1.1 Homepage", 3344, 0, 0.0, 713.7583732057418, 30, 9269, 227.0, 1739.0, 3661.5, 4739.80000000001, 0.9289438514000967, 74.18288850319477, 8.057410052577417], "isController": false}, {"data": ["1.3 Sign-in", 3338, 0, 0.0, 726.9086279209097, 68, 9036, 257.5, 1727.0, 3647.149999999999, 4719.980000000002, 0.9293305117470662, 64.11879231039555, 8.3310154483623], "isController": false}, {"data": ["Run some searches", 1679, 1, 0.05955926146515783, 1361.2793329362714, 0, 60007, 845.0, 3646.0, 3914.0, 5757.200000000001, 0.46964404394010933, 54.26604941956374, 3.50898533827378], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 388, 0, 0.0, 912.2499999999995, 215, 2730, 828.5, 1254.2, 1563.6499999999999, 2169.1700000000033, 0.11146702673197638, 5.578866164604191, 3.165647343231538], "isController": true}, {"data": ["2.1 Open session", 1641, 0, 0.0, 344.23400365630795, 118, 1685, 301.0, 548.0, 639.6999999999996, 906.7399999999998, 0.45839294862591057, 10.734600648014272, 3.3082095451811755], "isController": false}, {"data": ["4.3 Vaccination confirm", 1579, 0, 0.0, 597.1139962001254, 362, 2625, 536.0, 844.0, 1015.0, 1364.0000000000002, 0.4573840586448049, 9.829314947160409, 4.714587024776081], "isController": false}, {"data": ["4.1 Vaccination questions", 1611, 0, 0.0, 161.01241464928643, 85, 1315, 116.0, 269.79999999999995, 360.39999999999986, 747.6799999999957, 0.4598740613045522, 6.480030919822342, 4.312113814441244], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 35.0, 35, 35, 35.0, 35.0, 35.0, 35.0, 28.57142857142857, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3339, 0, 0.0, 2432.4309673555026, 251, 27330, 1095.0, 5165.0, 11148.0, 13353.599999999995, 0.9290949463245237, 239.9136480950284, 27.75196297263427], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 386, 0, 0.0, 885.924870466321, 207, 1786, 823.0, 1238.6, 1375.7999999999997, 1557.82, 0.11060796268442659, 5.926701452148588, 3.1443195114631113], "isController": true}, {"data": ["7.0 Open Children Search", 1690, 0, 0.0, 1259.6775147928995, 86, 9103, 789.5, 3635.3000000000006, 3860.3499999999995, 5184.45, 0.47123172164648924, 53.22935891782332, 3.3988799659353837], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.503018465909092, 14.026988636363637], "isController": false}, {"data": ["7.8 Year group search", 209, 0, 0.0, 1584.679425837321, 1341, 3877, 1500.0, 1847.0, 2142.5, 2737.9000000000015, 0.06027506772293195, 8.28078987087581, 0.4589727179974719], "isController": false}, {"data": ["7.9 DOB search", 186, 0, 0.0, 1068.4408602150525, 754, 3531, 954.0, 1454.5000000000002, 1661.25, 3322.199999999999, 0.05428319191005333, 7.422957163976828, 0.40901808254109545], "isController": false}, {"data": ["7.4 Partial name search", 182, 0, 0.0, 1711.0769230769224, 269, 11552, 899.0, 4563.100000000002, 5650.149999999998, 10519.479999999985, 0.05329869113642767, 7.199441505857878, 0.3928885242134197], "isController": false}, {"data": ["Debug Sampler", 1637, 0, 0.0, 0.3536957849725111, 0, 29, 0.0, 1.0, 1.0, 1.0, 0.4587581470206363, 2.6187409560259156, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1642, 0, 0.0, 551.2399512789272, 322, 1382, 539.0, 732.0, 810.8499999999999, 999.4099999999992, 0.45779337459793223, 37.79313110333082, 3.3012503729852], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.05208333333333, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1608, 0, 0.0, 149.39365671641767, 82, 1180, 114.0, 246.10000000000014, 339.1999999999998, 573.6400000000003, 0.45995502280610323, 7.416462443335143, 4.078150994037747], "isController": false}, {"data": ["7.5 Needs Consent search", 188, 1, 0.5319148936170213, 4112.888297872345, 3375, 60007, 3724.5, 4216.8, 4501.599999999999, 12257.609999999208, 0.05496082871574669, 7.469123863363287, 0.41521160019549097], "isController": false}, {"data": ["2.2 Session register", 1639, 0, 0.0, 159.94935936546682, 71, 1625, 106.0, 290.0, 403.0, 736.5999999999999, 0.4582888629095555, 19.48853172053075, 3.3114795628052867], "isController": false}, {"data": ["7.6 Needs triage search", 207, 0, 0.0, 220.95652173913044, 142, 871, 190.0, 334.0, 396.4, 736.8799999999999, 0.05842671258008975, 3.839804664346298, 0.4431872106889836], "isController": false}, {"data": ["7.3 Last name search", 173, 0, 0.0, 1301.8150289017335, 332, 8074, 814.0, 2695.199999999999, 3633.0999999999976, 8029.599999999999, 0.052258898436794377, 7.067590336245987, 0.38532382751270905], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 1, 14.285714285714286, 0.0034061105623488536], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, 85.71428571428571, 0.020436663374093122], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 29359, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1348, 6, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 188, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
